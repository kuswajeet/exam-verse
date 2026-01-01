
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { filterOptions, getExamsForCategory, getSubjectsForExam } from '@/lib/filter-options';
import type { Question, Test } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader, BookCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const createTestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  examName: z.string().min(1, 'Exam name is required'),
  subject: z.string().min(1, 'Subject is required'),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),
  isFree: z.boolean().default(true),
  price: z.coerce.number().optional(),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

export function CreateTestClientPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      title: '',
      category: '',
      examName: '',
      subject: '',
      durationMinutes: 60,
      totalMarks: 100,
      isFree: true,
      price: 0,
    },
  });

  const { category, examName, subject } = form.watch();

  const questionsQuery = useMemoFirebase(() => {
    if (!firestore || !category || !examName || !subject) return null;
    return query(
      collection(firestore, 'questions'),
      where('category', '==', category),
      where('examName', '==', examName),
      where('subject', '==', subject)
    );
  }, [firestore, category, examName, subject]);

  const { data: availableQuestions, isLoading: isLoadingQuestions } = useCollection<Question>(questionsQuery);
  const questionCount = availableQuestions?.length ?? 0;
  
  const examsForCategory = useMemo(() => getExamsForCategory(category), [category]);
  const subjectsForExam = useMemo(() => getSubjectsForExam(category, examName), [category, examName]);

  async function onSubmit(values: CreateTestForm) {
    setIsSubmitting(true);
    if (questionCount === 0) {
      toast({
        variant: 'destructive',
        title: 'No Questions Available',
        description: 'Cannot create a test with zero questions. Please adjust filters or upload questions.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const testCollection = collection(firestore, 'tests');
      const testData: Omit<Test, 'id'> = {
        ...values,
        price: values.isFree ? 0 : values.price || 0,
        isPublished: true, // Auto-publish on creation
        createdAt: serverTimestamp() as any, // Let server set the timestamp
      };

      await addDoc(testCollection, testData);

      toast({
        title: 'Test Created Successfully!',
        description: `"${values.title}" has been published.`,
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

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6 pt-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filterOptions.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!category}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {examsForCategory.map((exam) => (
                          <SelectItem key={exam.value} value={exam.value}>
                            {exam.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!examName}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjectsForExam.map((subj) => (
                          <SelectItem key={subj.value} value={subj.value}>
                            {subj.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {subject && (
              <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                {isLoadingQuestions ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <BookCheck className="h-5 w-5 text-primary" />
                    <span className="font-medium">Available Questions:</span>
                    <Badge variant={questionCount > 0 ? "default" : "destructive"}>{questionCount}</Badge>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Test Access</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Is this test free for all users?
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
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
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
