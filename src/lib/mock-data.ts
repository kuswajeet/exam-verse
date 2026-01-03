import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

import type { Material, Question, Test, TestWithQuestions } from '@/lib/types';

const QUESTIONS_COLLECTION = collection(db, 'questions');
const TESTS_COLLECTION = collection(db, 'tests');
const MATERIALS_COLLECTION = collection(db, 'materials');

async function buildQuestionMap(): Promise<Map<string, Question>> {
  const snapshot = await getDocs(QUESTIONS_COLLECTION);
  const map = new Map<string, Question>();

  snapshot.docs.forEach((questionDoc) => {
    map.set(questionDoc.id, { id: questionDoc.id, ...(questionDoc.data() as Question) });
  });

  return map;
}

function attachQuestions(test: Test, questionMap: Map<string, Question>): TestWithQuestions {
  const questionIds: string[] = Array.isArray(test.questionIds) ? test.questionIds : [];
  const questions = questionIds
    .map((questionId) => questionMap.get(questionId))
    .filter((question): question is Question => Boolean(question));

  return { ...test, questions };
}

export async function getMockTests(): Promise<TestWithQuestions[]> {
  const [testsSnapshot, questionMap] = await Promise.all([
    getDocs(TESTS_COLLECTION),
    buildQuestionMap(),
  ]);

  return testsSnapshot.docs.map((testDoc) =>
    attachQuestions({ id: testDoc.id, ...(testDoc.data() as Test) }, questionMap)
  );
}

export async function getMockTestById(id: string): Promise<TestWithQuestions | undefined> {
  const testSnapshot = await getDoc(doc(TESTS_COLLECTION, id));
  if (!testSnapshot.exists()) {
    return undefined;
  }

  const questionMap = await buildQuestionMap();
  return attachQuestions({ id: testSnapshot.id, ...(testSnapshot.data() as Test) }, questionMap);
}

export async function getMockMaterials(): Promise<Omit<Material, 'createdAt'>[]> {
  const snapshot = await getDocs(MATERIALS_COLLECTION);

  return snapshot.docs.map((materialDoc) => {
    const data = materialDoc.data() as Material;
    const { createdAt, ...rest } = data;
    return { id: materialDoc.id, ...rest };
  });
}

export async function getMockOneLiners(): Promise<Question[]> {
  const oneLinerQuery = query(QUESTIONS_COLLECTION, where('questionType', '==', 'one_liner'));
  const snapshot = await getDocs(oneLinerQuery);

  return snapshot.docs.map((questionDoc) => ({
    id: questionDoc.id,
    ...(questionDoc.data() as Question),
  }));
}
