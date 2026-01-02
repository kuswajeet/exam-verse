
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Loader, PlusCircle, Trash2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sampleOneLiners = [
  {
    questionText: 'What is the powerhouse of the cell?',
    options: ['Mitochondria'],
    correctAnswerIndex: 0,
    explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.",
    category: 'Medical',
    examName: 'NEET',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
  {
    questionText: 'What force keeps planets in orbit around the sun?',
    options: ['Gravity'],
    correctAnswerIndex: 0,
    explanation: 'Gravity is the fundamental force of attraction that governs the motion of planets and stars.',
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Physics',
    topic: 'Gravitation',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
    {
    questionText: 'What is the main component of natural gas?',
    options: ['Methane'],
    correctAnswerIndex: 0,
    explanation: 'Methane (CH4) is the primary component of natural gas, making up 70-90% of its composition.',
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Chemistry',
    topic: 'Hydrocarbons',
    difficulty: 'medium',
    questionType: 'one_liner',
  },
  {
    questionText: 'Who is known as the father of the computer?',
    options: ['Charles Babbage'],
    correctAnswerIndex: 0,
    explanation: 'Charles Babbage, an English mathematician, is credited with originating the concept of a digital programmable computer.',
    category: 'General',
    examName: 'General',
    subject: 'Computer Science',
    topic: 'History of Computing',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
  {
    questionText: 'What is the chemical symbol for gold?',
    options: ['Au'],
    correctAnswerIndex: 0,
    explanation: 'The symbol Au comes from the Latin word for gold, "aurum".',
    category: 'General',
    examName: 'General',
    subject: 'Chemistry',
    topic: 'Elements',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
];

const sampleMultipleChoice = [
  {
    questionText: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctAnswerIndex: 1,
    explanation: 'Mercury is the smallest planet in our solar system and the closest to the Sun.',
    category: 'General',
    examName: 'SAT',
    subject: 'Astronomy',
    topic: 'Solar System',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    questionText: 'What is the largest organ in the human body?',
    options: ['Liver', 'Brain', 'Skin', 'Heart'],
    correctAnswerIndex: 2,
    explanation: 'The skin is the largest organ of the body, with a total area of about 20 square feet.',
    category: 'Medical',
    examName: 'NEET',
    subject: 'Biology',
    topic: 'Human Anatomy',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
  {
    questionText: 'Which of the following is a prime number?',
    options: ['9', '15', '23', '27'],
    correctAnswerIndex: 2,
    explanation: 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. 23 fits this definition.',
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Maths',
    topic: 'Number Theory',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    questionText: 'What is the capital of Japan?',
    options: ['Beijing', 'Seoul', 'Bangkok', 'Tokyo'],
    correctAnswerIndex: 3,
    explanation: 'Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional, from skyscrapers to historic temples.',
    category: 'General',
    examName: 'General',
    subject: 'Geography',
    topic: 'World Capitals',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    questionText: 'The law of inertia is also known as:',
    options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
    correctAnswerIndex: 0,
    explanation: "Newton's First Law of Motion states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Physics',
    topic: 'Laws of Motion',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
];


export default function ManageQuestionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  
  const questionsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'questions'), orderBy('topic', 'asc')) : null, 
    [firestore]
  );
  const { data: questions, isLoading, error } = useCollection<Question>(questionsQuery);

  const handleSeedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    try {
      const batch = writeBatch(firestore);
      const questionsRef = collection(firestore, 'questions');
      
      const allSamples = [...sampleOneLiners, ...sampleMultipleChoice];

      allSamples.forEach((q) => {
        const docRef = doc(questionsRef); // Auto-generate ID
        batch.set(docRef, { ...q, id: docRef.id });
      });

      await batch.commit();

      toast({
        title: 'Success!',
        description: `${allSamples.length} sample questions have been added.`,
        className: 'bg-green-100 dark:bg-green-900',
      });

      // Simple way to refresh the data shown in the useCollection hook
      window.location.reload();

    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to seed sample data.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Questions</CardTitle>
          <CardDescription>View, edit, or delete all questions in the database.</CardDescription>
        </div>
        <Button onClick={handleSeedData} disabled={isSeeding}>
          {isSeeding ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Add Sample Data
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Question Text</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Loading questions...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={5} className="text-center text-red-500 h-24">Error loading questions.</TableCell></TableRow>
            ) : questions?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">No questions found. Try adding some sample data!</TableCell></TableRow>
            ) : (
              questions?.map(question => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-sm truncate">{question.questionText}</TableCell>
                  <TableCell><Badge variant={question.questionType === 'one_liner' ? 'outline' : 'secondary'}>{question.questionType}</Badge></TableCell>
                  <TableCell>{question.topic}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}
                    >
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
