'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, Zap } from 'lucide-react';
import type { Question, Test } from '@/lib/types';

const sampleQuestions: Omit<Question, 'id'>[] = [
    {
        questionText: 'What is the chemical symbol for water?',
        options: ['O2', 'H2O', 'CO2', 'NaCl'],
        correctAnswerIndex: 1,
        explanation: 'H2O represents two hydrogen atoms and one oxygen atom, which is the composition of a water molecule.',
        category: 'Science',
        examName: 'General Science',
        subject: 'Chemistry',
        topic: 'Basic Chemistry',
        difficulty: 'easy',
        questionType: 'single_choice',
    },
    {
        questionText: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswerIndex: 1,
        explanation: 'Mars is often referred to as the "Red Planet" because the iron oxide prevalent on its surface gives it a reddish appearance.',
        category: 'Science',
        examName: 'General Science',
        subject: 'Astronomy',
        topic: 'Solar System',
        difficulty: 'easy',
        questionType: 'single_choice',
    },
    {
        questionText: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Cell Wall'],
        correctAnswerIndex: 2,
        explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
        category: 'Science',
        examName: 'General Science',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'medium',
        questionType: 'single_choice',
    },
];

export function DataSeeder() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    setIsSeeding(true);

    try {
      const batch = writeBatch(firestore);
      const questionsCollection = collection(firestore, 'questions');
      const testsCollection = collection(firestore, 'tests');

      // 1. Create new question documents and collect their IDs
      const questionIds: string[] = [];
      sampleQuestions.forEach((qData) => {
        const questionRef = doc(questionsCollection); // Create a new doc with a random ID
        batch.set(questionRef, { ...qData, id: questionRef.id }); // Add the ID to the doc data
        questionIds.push(questionRef.id);
      });

      // 2. Create the test document
      const testRef = doc(testsCollection, 'sample-science-mock-1');
      const testData: Omit<Test, 'id'> = {
        title: 'General Science Mock 1',
        durationMinutes: 30,
        category: 'Science',
        examName: 'General Science',
        subject: 'Mixed',
        questionIds: questionIds,
        questionCount: questionIds.length,
        totalMarks: questionIds.length,
        isFree: true,
        price: 0,
        isPublished: true,
        testType: 'exam',
        testSubType: 'full',
      };
      batch.set(testRef, testData);

      // 3. Commit the batch
      await batch.commit();

      toast({
        title: 'Success!',
        description: 'Sample test and 3 questions have been injected into the database.',
        className: 'bg-green-100 dark:bg-green-900',
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-dashed border-amber-500 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Zap /> Developer Tool: Data Seeder
        </CardTitle>
        <CardDescription>
          If your database is empty, click this button to inject a sample test and questions. This will fix empty or loading pages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeedData} disabled={isSeeding} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
          {isSeeding ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Injecting...
            </>
          ) : (
            'Inject Sample Test Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
