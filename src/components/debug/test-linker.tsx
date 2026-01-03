'use client';

import { useState } from 'react';
import { db } from '@/firebase/index';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, Link2 } from 'lucide-react';
import type { Test } from '@/lib/types';

const hardcodedQuestionIds = ['lsuYepfD0td9iRkEc6co', 'b1iFgLR62EX9fYtHcfAG', 'utmkFcqZz4szcHnKkTD2'];

export function TestLinker() {
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);

  const linkTest = async () => {
    setIsLinking(true);
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database connection is not available.',
      });
      setIsLinking(false);
      return;
    }

    try {
      const testData: Omit<Test, 'id'> = {
        title: 'General Science (Recovered)',
        examName: 'General Science (Recovered)',
        durationMinutes: 30,
        category: 'Science',
        subject: 'Mixed',
        questionIds: hardcodedQuestionIds,
        questionCount: hardcodedQuestionIds.length,
        totalMarks: hardcodedQuestionIds.length,
        isFree: true,
        price: 0,
        examPrice: 0,
        isPublished: true,
        testType: 'exam',
        testSubType: 'full',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tests'), testData);

      toast({
        title: "Test Linked!",
        description: "A new test has been created. The page will reload.",
        className: 'bg-green-100 dark:bg-green-900',
      });
      
      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Linking Failed',
        description: errorMessage,
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Card className="border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Link2 /> Developer Tool: Test Linker
        </CardTitle>
        <CardDescription>
          Use this if the data seeder created questions but failed to create the parent test. It links the hardcoded question IDs to a new test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={linkTest} disabled={isLinking} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLinking ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Linking...
            </>
          ) : (
            'Finish Repair (Link Test)'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
