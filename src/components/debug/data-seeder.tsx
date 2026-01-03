
'use client';

import { useState } from 'react';
import { db } from '@/firebase/index';
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
        examName: 'General Science Repair Test',
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
        examName: 'General Science Repair Test',
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
        examName: 'General Science Repair Test',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'medium',
        questionType: 'single_choice',
    },
];

export function DataSeeder() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const repairDatabase = async () => {
    if (!db) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    setIsSeeding(true);

    try {
      const batch = writeBatch(db);
      const questionsCollection = collection(db, 'questions');
      const testsCollection = collection(db, 'tests');

      // 1. Create 3 new Question documents and capture their real IDs
      const questionIds: string[] = [];
      sampleQuestions.forEach((qData) => {
        const questionRef = doc(questionsCollection); // Create a new doc reference with a random ID
        batch.set(questionRef, { ...qData, id: questionRef.id }); // Add the ID to the doc data itself
        questionIds.push(questionRef.id); // Capture the real ID
      });

      // 2. Create the new Test document using the captured IDs
      const testRef = doc(testsCollection); // Create a new test doc reference
      const testData: Omit<Test, 'id'> = {
        title: 'General Science Repair Test',
        examName: 'General Science Repair Test', // Set examName
        durationMinutes: 45, // Set duration
        category: 'Science',
        subject: 'Mixed',
        questionIds: questionIds, // Use the real, captured IDs
        questionCount: questionIds.length,
        totalMarks: questionIds.length,
        isFree: true,
        price: 0,
        isPublished: true,
        testType: 'exam',
        testSubType: 'full',
      };
      batch.set(testRef, testData);

      // 3. Commit all writes at once
      await batch.commit();

      toast({
        title: 'Database Repaired!',
        description: 'A valid test with 3 correctly linked questions has been generated.',
        className: 'bg-green-100 dark:bg-green-900',
      });
    } catch (error) {
      console.error('Error repairing data:', error);
      toast({
        variant: 'destructive',
        title: 'Repair Failed',
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
          If your data has broken links or is empty, click this button to generate a new, perfectly valid test with linked questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={repairDatabase} disabled={isSeeding} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
          {isSeeding ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Repairing...
            </>
          ) : (
            'Repair & Generate Valid Test'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
