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
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { Test } from "@/lib/types";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock } from "lucide-react";
import { filterOptions, getExamsForCategory, getSubjectsForExam } from "@/lib/filter-options";

export default function TestsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const testsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "tests") : null),
    [firestore]
  );
  const { data: tests, isLoading: isLoadingTests } = useCollection<Test>(testsQuery);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedExam('');
    setSelectedSubject('');
  };

  const handleExamChange = (value: string) => {
    setSelectedExam(value);
    setSelectedSubject('');
  };
  
  const filteredTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter(test => {
      const categoryMatch = !selectedCategory || test.category === selectedCategory;
      const examMatch = !selectedExam || test.examName === selectedExam;
      const subjectMatch = !selectedSubject || test.subject === selectedSubject;
      return categoryMatch && examMatch && subjectMatch;
    });
  }, [tests, selectedCategory, selectedExam, selectedSubject]);

  const examsForCategory = useMemo(() => getExamsForCategory(selectedCategory), [selectedCategory]);
  const subjectsForExam = useMemo(() => getSubjectsForExam(selectedCategory, selectedExam), [selectedCategory, selectedExam]);

  const isLoading = isLoadingTests;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Tests</CardTitle>
          <CardDescription>
            Choose a test to start preparing. Good luck!
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
      <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredTests.length > 0 ? (
              filteredTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell>{test.subject}</TableCell>
                <TableCell>{test.questionCount || 0}</TableCell>
                <TableCell>{test.durationMinutes} min</TableCell>
                <TableCell>
                  {test.isFree ? (
                    <Badge variant="outline">Free</Badge>
                  ) : (
                    `$${test.price.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="text-right">
                    {test.isFree ? (
                        <Button asChild>
                            <Link href={`/dashboard/tests/${test.id}`}>Start Test</Link>
                        </Button>
                    ) : (
                        <Button disabled>
                            <Lock className="mr-2 h-4 w-4" />
                            Purchase
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tests match your filter criteria. Try clearing the filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      </Card>
    </div>
  );
}
