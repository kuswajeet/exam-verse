
'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Loader } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, Test } from '@/lib/types';

const questionSchema = z.object({
  questionText: z.string().min(5, 'Question text is too short'),
  options: z.tuple([
    z.string().min(1, 'Option 1 is required'),
    z.string().min(1, 'Option 2 is required'),
    z.string().min(1, 'Option 3 is required'),
    z.string().min(1, 'Option 4 is required'),
  ]),
  correctAnswerIndex: z.coerce.number().min(0).max(3),
  explanation: z.string().min(5, 'Explanation is too short'),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const testSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  durationMinutes: z.coerce.number().min(1, 'Duration must be positive'),
  category: z.string().min(1, 'Category is required'),
  examName: z.string().min(1, 'Exam name is required'),
  subject: z.string().min(1, 'Subject is required'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export function CreateTestManualClientPage() {
  const form = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: '',
      durationMinutes: 30,
      category: '',
      examName: '',
      subject: '',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: z.infer<typeof testSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Save all questions and get their IDs
      const questionDocs: Omit<Question, 'id'>[] = values.questions.map(q => ({
        ...q,
        category: values.category,
        examName: values.examName,
        subject: values.subject,
        questionType: 'single_choice',
      }));

      const questionIds: string[] = [];
      for (const qData of questionDocs) {
        const qRef = await addDoc(collection(firestore, 'questions'), qData);
        questionIds.push(qRef.id);
      }

      // 2. Create the test document with question IDs
      const testData: Omit<Test, 'id'> = {
        title: values.title,
        durationMinutes: values.durationMinutes,
        category: values.category,
        examName: values.examName,
        subject: values.subject,
        questionIds: questionIds,
        questionCount: questionIds.length,
        totalMarks: questionIds.length,
        isFree: true, // Defaulting to free, can be changed later
        price: 0,
        isPublished: true,
        createdAt: serverTimestamp(),
        testType: 'exam', // Defaulting
        testSubType: 'full', // Defaulting
      };
      
      await addDoc(collection(firestore, 'tests'), testData);
      
      toast({ title: 'Success!', description: 'Test and questions published successfully.', className: 'bg-green-100 dark:bg-green-900'});
      router.push('/dashboard/tests');

    } catch (error) {
      console.error('Error creating test:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create test.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const addNewQuestion = () => {
    append({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      topic: '',
      difficulty: 'medium',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Test Title</FormLabel><FormControl><Input placeholder="e.g., Physics Mock Test 1" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="durationMinutes" render={({ field }) => (
              <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Engineering" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="examName" render={({ field }) => (
              <FormItem><FormLabel>Exam Name</FormLabel><FormControl><Input placeholder="e.g., JEE Main" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="subject" render={({ field }) => (
              <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Physics" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add at least one question to the test.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addNewQuestion}><PlusCircle className="mr-2" /> Add Question</Button>
            </div>
             {form.formState.errors.questions?.root && (
                <FormMessage>{form.formState.errors.questions.root.message}</FormMessage>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-6 border rounded-lg relative bg-card space-y-4">
                <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <h4 className="font-semibold">Question {index + 1}</h4>
                
                <FormField control={form.control} name={`questions.${index}.questionText`} render={({ field }) => (
                  <FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea placeholder="What is the speed of light?" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, optIndex) => (
                        <FormField key={optIndex} control={form.control} name={`questions.${index}.options.${optIndex}` as const} render={({ field }) => (
                           <FormItem><FormLabel>Option {optIndex + 1}</FormLabel><FormControl><Input placeholder={`Answer option ${optIndex + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name={`questions.${index}.correctAnswerIndex`} render={({ field }) => (
                      <FormItem><FormLabel>Correct Answer</FormLabel>
                        <Select onValueChange={v => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="0">Option 1</SelectItem>
                                <SelectItem value="1">Option 2</SelectItem>
                                <SelectItem value="2">Option 3</SelectItem>
                                <SelectItem value="3">Option 4</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`questions.${index}.topic`} render={({ field }) => (
                        <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., Optics" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name={`questions.${index}.difficulty`} render={({ field }) => (
                       <FormItem><FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                       <FormMessage /></FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name={`questions.${index}.explanation`} render={({ field }) => (
                  <FormItem><FormLabel>Explanation</FormLabel><FormControl><Textarea placeholder="Explain why this is the correct answer." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
            ))}
             {fields.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    <p>No questions yet. Click "Add Question" to start building your test.</p>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 animate-spin" />}
              Publish Exam
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
