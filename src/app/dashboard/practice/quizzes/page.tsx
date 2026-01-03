
'use client';

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, FileQuestion, Clock, CheckCircle } from "lucide-react";
import { filterOptions, getExamsForCategory, getSubjectsForExam } from "@/lib/filter-options";
import { getMockTests } from "@/lib/mock-data";
import type { TestWithQuestions } from "@/lib/types";

export default function QuizzesPage() {
  const [allQuizzes, setAllQuizzes] = useState<TestWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const allTests = await getMockTests();
      // Filter for tests that are marked as quizzes
      const quizzesData = allTests.filter(test => test.testType === 'quiz');
      setAllQuizzes(quizzesData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedExam('');
    setSelectedSubject('');
  };

  const handleExamChange = (value: string) => {
    setSelectedExam(value);
    setSelectedSubject('');
  };
  
  const filteredQuizzes = useMemo(() => {
    if (!allQuizzes) return [];
    return allQuizzes.filter(quiz => {
      const categoryMatch = !selectedCategory || quiz.category === selectedCategory;
      const examMatch = !selectedExam || quiz.examName === selectedExam;
      const subjectMatch = !selectedSubject || quiz.subject === selectedSubject;
      return categoryMatch && examMatch && subjectMatch;
    });
  }, [allQuizzes, selectedCategory, selectedExam, selectedSubject]);

  const examsForCategory = useMemo(() => getExamsForCategory(selectedCategory), [selectedCategory]);
  const subjectsForExam = useMemo(() => getSubjectsForExam(selectedCategory, selectedExam), [selectedCategory, selectedExam]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Practice Quizzes</CardTitle>
          <CardDescription>
            Sharpen your skills with these practice quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {filterOptions.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select onValueChange={handleExamChange} value={selectedExam} disabled={!selectedCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                    {examsForCategory.map(exam => (
                         <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedExam}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                    {subjectsForExam.map(subj => (
                        <SelectItem key={subj.value} value={subj.value}>{subj.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => { setSelectedCategory(''); setSelectedExam(''); setSelectedSubject(''); }} variant="outline">Clear Filters</Button>
        </CardContent>
      </Card>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
              ))
            ) : filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.category} / {quiz.examName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <FileQuestion className="h-4 w-4" />
                           <span>{quiz.questionCount || quiz.questions?.length || 0} Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{quiz.durationMinutes} min</span>
                        </div>
                    </div>
                    <Badge variant="secondary">{quiz.subject}</Badge>
                </CardContent>
                <CardFooter>
                    {quiz.isFree ? (
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/tests/${quiz.id}`}>Start Quiz</Link>
                        </Button>
                    ) : (
                        <Button disabled className="w-full">
                            <Lock className="mr-2 h-4 w-4" />
                            Purchase
                        </Button>
                    )}
                </CardFooter>
              </Card>
            ))) : (
              <div className="col-span-full text-center py-12">
                 <Card>
                    <CardContent className="pt-6">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Quizzes Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            There are no quizzes matching your current filters. Try clearing them to see all available quizzes.
                        </p>
                    </CardContent>
                </Card>
              </div>
            )}
      </div>
    </div>
  );
}
