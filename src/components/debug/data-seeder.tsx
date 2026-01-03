
'use client';

import { useState } from 'react';
import { db } from '@/firebase/index';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, Zap } from 'lucide-react';
import type { Question, Test } from '@/lib/types';

const sampleQuestions: Omit<Question, 'id'>[] = [
    {
        questionText: 'What is the chemical symbol for Gold?',
        options: ['Au', 'Ag', 'Gd', 'Ga'],
        correctAnswerIndex: 0,
        explanation: 'The symbol Au for gold is from its Latin name, aurum, which means "shining dawn".',
        category: 'Science',
        examName: 'General Science Repair Test',
        subject: 'Chemistry',
        topic: 'Basic Chemistry',
        difficulty: 'easy',
        questionType: 'single_choice',
    },
    {
        questionText: 'Which law of motion states that for every action, there is an equal and opposite reaction?',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
        correctAnswerIndex: 2,
        explanation: 'Newton\'s Third Law of Motion describes the action-reaction pair that occurs whenever two objects interact.',
        category: 'Science',
        examName: 'General Science Repair Test',
        subject: 'Physics',
        topic: 'Laws of Motion',
        difficulty: 'easy',
        questionType: 'single_choice',
    },
    {
        questionText: 'What part of the plant is responsible for photosynthesis?',
        options: ['Roots', 'Stem', 'Leaves', 'Flower'],
        correctAnswerIndex: 2,
        explanation: 'The leaves are the primary site of photosynthesis, containing chlorophyll which captures light energy.',
        category: 'Science',
        examName: 'General Science Repair Test',
        subject: 'Biology',
        topic: 'Botany',
        difficulty: 'medium',
        questionType: 'single_choice',
    },
];

export function DataSeeder() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const repairDatabase = async () => {
    setIsSeeding(true);

    try {
      if (!db) {
        throw new Error("Database connection is missing/undefined");
      }
      
      const questionsCollection = collection(db, 'questions');
      const testsCollection = collection(db, 'tests');

      const questionIds: string[] = [];

      for (const qData of sampleQuestions) {
        const questionRef = await addDoc(questionsCollection, { ...qData, createdAt: serverTimestamp() });
        questionIds.push(questionRef.id);
      }
      
      const testData: Omit<Test, 'id'> = {
        title: 'General Science Repair Test',
        examName: 'General Science Repair Test',
        durationMinutes: 45,
        category: 'Science',
        subject: 'Mixed',
        questionIds: questionIds,
        questionCount: questionIds.length,
        totalMarks: questionIds.length,
        isFree: true,
        price: 0,
        examPrice: 0,
        isPublished: true,
        testType: 'exam',
        testSubType: 'full',
        createdAt: serverTimestamp(),
      };
      
      const testRef = await addDoc(testsCollection, testData);

      toast({
          title: "Database Repaired",
          description: `Created ${questionIds.length} questions and 1 test (${testRef.id}). Page will reload.`,
          className: "bg-green-100 dark:bg-green-900"
      });

      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
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
    <Card className="border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Zap /> Developer Tool: Data Seeder
        </CardTitle>
        <CardDescription>
          If your data is empty or corrupted, click this to generate a new, valid test with linked questions.
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
