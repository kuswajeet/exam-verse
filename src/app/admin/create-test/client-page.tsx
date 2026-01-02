
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, CollectionReference, DocumentData } from 'firebase/firestore';
import type { Question, Test } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader, BookCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const createTestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  testType: z.enum(['exam', 'quiz']).default('exam'),
  testSubType: z.enum(['full', 'subject', 'topic']).default('full'),
  category: z.string(),
  examName: z.string(),
  subject: z.string(),
  topic: z.string(),
  subTopic: z.string(),
  difficulty: z.string(),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),
  isFree: z.boolean().default(true),
  price: z.coerce.number().optional(),
  examPrice: z.coerce.number().optional(),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

export function CreateTestClientPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  const [uniqueValues, setUniqueValues] = useState({
    categories: [] as string[],
    examNames: [] as string[],
    subjects: [] as string[],
    topics: [] as string[],
    subTopics: [] as string[],
    difficulties: ['easy', 'medium', 'hard'],
  });

  const form = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      title: '',
      testType: 'exam',
      testSubType: 'full',
      category: '',
      examName: '',
      subject: '',
      topic: '',
      subTopic: '',
      difficulty: '',
      durationMinutes: 60,
      totalMarks: 100,
      isFree: true,
      price: 0,
      examPrice: 0,
    },
  });

  const formValues = form.watch();

  // Fetch all questions to extract unique values for datalists
  const allQuestionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'questions') : null, [firestore]);
  const { data: allQuestions } = useCollection<Question>(allQuestionsQuery);

  useEffect(() => {
    if (allQuestions) {
      const categories = new Set<string>();
      const examNames = new Set<string>();
      const subjects = new Set<string>();
      const topics = new Set<string>();
      const subTopics = new Set<string>();

      allQuestions.forEach(q => {
        if (q.category) categories.add(q.category);
        if (q.examName) examNames.add(q.examName);
        if (q.subject) subjects.add(q.subject);
        if (q.topic) topics.add(q.topic);
        if (q.subTopic) subTopics.add(q.subTopic);
      });

      setUniqueValues(prev => ({
        ...prev,
        categories: Array.from(categories),
        examNames: Array.from(examNames),
        subjects: Array.from(subjects),
        topics: Array.from(topics),
        subTopics: Array.from(subTopics),
      }));
    }
  }, [allQuestions]);

  // Query for available questions based on form filters
  const questionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: CollectionReference | Query = collection(firestore, 'questions');
    if (formValues.category) q = query(q, where('category', '==', formValues.category));
    if (formValues.examName) q = query(q, where('examName', '==', formValues.examName));
    if (formValues.subject) q = query(q, where('subject', '==', formValues.subject));
    if (formValues.topic) q = query(q, where('topic', '==', formValues.topic));
    if (formValues.subTopic) q = query(q, where('subTopic', '==', formValues.subTopic));
    if (formValues.difficulty) q = query(q, where('difficulty', '==', formValues.difficulty));
    return q as Query<DocumentData>;
  }, [firestore, formValues.category, formValues.examName, formValues.subject, formValues.topic, formValues.subTopic, formValues.difficulty]);

  const { data: availableQuestions, isLoading: isLoadingQuestions } = useCollection<Question>(questionsQuery);
  const questionCount = availableQuestions?.length ?? 0;

  // Sync selected IDs with available questions
  useEffect(() => {
    if (availableQuestions) {
      const availableIds = new Set(availableQuestions.map(q => q.id));
      setSelectedQuestionIds(availableIds);
    } else {
      setSelectedQuestionIds(new Set());
    }
  }, [availableQuestions]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && availableQuestions) {
      setSelectedQuestionIds(new Set(availableQuestions.map(q => q.id)));
    } else {
      setSelectedQuestionIds(new Set());
    }
  };

  const handleSelectQuestion = (id: string, checked: boolean) => {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  async function onSubmit(values: CreateTestForm) {
    setIsSubmitting(true);
    const finalQuestionIds = Array.from(selectedQuestionIds);

    if (finalQuestionIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Questions Selected',
        description: 'Cannot create a test with zero questions. Please select at least one question.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const testCollection = collection(firestore, 'tests');
      const testData: Partial<Test> & { createdAt: any } = {
        title: values.title,
        testType: values.testType,
        testSubType: values.testSubType,
        category: values.category,
        examName: values.examName,
        subject: values.subject,
        durationMinutes: values.durationMinutes,
        totalMarks: values.totalMarks,
        isFree: values.isFree,
        price: values.isFree ? 0 : values.price || 0,
        examPrice: values.examPrice || 0,
        questionIds: finalQuestionIds,
        questionCount: finalQuestionIds.length,
        isPublished: true,
        createdAt: serverTimestamp(),
      };

      await addDoc(testCollection, testData);

      toast({
        title: 'Test Created Successfully!',
        description: `"${values.title}" has been created with ${finalQuestionIds.length} questions.`,
        className: 'bg-green-100 dark:bg-green-900',
      });

      router.push('/dashboard/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        variant: 'destructive',
        title: 'Error Creating Test',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderFilterInput = (name: keyof CreateTestForm, label: string, listId: string, options: string[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder="Select or type new..." {...field} list={listId} />
          </FormControl>
          <datalist id={listId}>
            {options.map(opt => <option key={opt} value={opt} />)}
          </datalist>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Physics Chapter 1 Mock" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a test type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="exam">Main Exam - for Tests page</SelectItem>
                            <SelectItem value="quiz">Practice Quiz - for Quizzes page</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="testSubType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Sub-Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a sub-type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="full">Full Mock Test</SelectItem>
                            <SelectItem value="subject">Subject Wise Test</SelectItem>
                             <SelectItem value="topic">Topic Wise Test</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="examPrice"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Bundle Price (₹)</FormLabel>
                      <FormControl>
                      <Input type="number" placeholder="e.g., 999" {...field} />
                      </FormControl>
                      <FormDescription>If 0, the exam is Free.</FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFilterInput('category', 'Category', 'category-list', uniqueValues.categories)}
              {renderFilterInput('examName', 'Exam', 'exam-list', uniqueValues.examNames)}
              {renderFilterInput('subject', 'Subject', 'subject-list', uniqueValues.subjects)}
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFilterInput('topic', 'Topic', 'topic-list', uniqueValues.topics)}
              {renderFilterInput('subTopic', 'Sub-Topic', 'subtopic-list', uniqueValues.subTopics)}
              {renderFilterInput('difficulty', 'Difficulty', 'difficulty-list', uniqueValues.difficulties)}
            </div>
            
            <FormDescription>
              Filter questions by typing exact values (case-sensitive) or selecting from existing options. Leave fields blank to ignore them.
            </FormDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Test Access</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Is this single test free? (Bundle price is separate)
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                    />
                {!form.watch('isFree') && (
                     <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Single Test Price ($)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Questions ({selectedQuestionIds.size} / {questionCount} selected)</h3>
                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox 
                                        checked={questionCount > 0 && selectedQuestionIds.size === questionCount}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Question Text</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Sub-Topic</TableHead>
                                <TableHead>Difficulty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingQuestions ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : questionCount > 0 ? (
                                availableQuestions?.map(q => (
                                    <TableRow key={q.id} data-state={selectedQuestionIds.has(q.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedQuestionIds.has(q.id)}
                                                onCheckedChange={(checked) => handleSelectQuestion(q.id, !!checked)}
                                                aria-label={`Select question ${q.id}`}
                                            />
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate font-medium">{q.questionText}</TableCell>
                                        <TableCell>{q.topic}</TableCell>
                                        <TableCell>{q.subTopic || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={q.difficulty === 'hard' ? 'destructive' : 'secondary'}>{q.difficulty}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No questions match the current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isLoadingQuestions}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : 'Publish Test'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
