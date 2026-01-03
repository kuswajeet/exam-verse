
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Material } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader, Trash2, PlusCircle, Book, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Timestamp } from 'firebase/firestore';


const MOCK_ADMIN_MATERIALS: Material[] = [
    { id: 'mock-mat-1', title: 'Physics Formula Sheet', type: 'PDF', subject: 'Physics', content: 'https://example.com/physics.pdf', createdAt: { seconds: new Date('2024-05-20').getTime() / 1000, nanoseconds: 0 } as Timestamp },
    { id: 'mock-mat-2', title: 'Organic Chemistry Reactions', type: 'PDF', subject: 'Chemistry', content: 'https://example.com/chem.pdf', createdAt: { seconds: new Date('2024-05-18').getTime() / 1000, nanoseconds: 0 } as Timestamp },
    { id: 'mock-mat-3', title: 'Cell Biology Basics', type: 'Note', subject: 'Biology', content: 'The cell is the basic structural, functional, and biological unit of all known organisms...', createdAt: { seconds: new Date('2024-05-15').getTime() / 1000, nanoseconds: 0 } as Timestamp },
    { id: 'mock-mat-4', title: 'Key Historical Dates', type: 'Note', subject: 'History', content: '1066: Battle of Hastings\n1492: Columbus reaches the Americas\n1776: US Declaration of Independence', createdAt: { seconds: new Date('2024-05-12').getTime() / 1000, nanoseconds: 0 } as Timestamp },
    { id: 'mock-mat-5', title: 'Calculus Cheat Sheet', type: 'PDF', subject: 'Math', content: 'https://example.com/calculus.pdf', createdAt: { seconds: new Date('2024-05-10').getTime() / 1000, nanoseconds: 0 } as Timestamp },
];


const materialSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  subject: z.string().min(3, 'Subject is too short'),
  type: z.enum(['PDF', 'Note']),
  content: z.string().min(10, 'Content is too short'),
});

type MaterialForm = z.infer<typeof materialSchema>;

export default function ManageMaterialsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materials, setMaterials] = useState<Material[]>(MOCK_ADMIN_MATERIALS);

  const form = useForm<MaterialForm>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: '',
      subject: '',
      type: 'Note',
      content: '',
    },
  });

  const materialType = form.watch('type');

  async function onSubmit(values: MaterialForm) {
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
        const newMaterial: Material = {
            id: `mock-${Date.now()}`,
            ...values,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
        };

        setMaterials(prev => [newMaterial, ...prev]);
        
        toast({
            title: 'Success! (Mock)',
            description: 'New study material has been added to the local list.',
            className: 'bg-green-100 dark:bg-green-900',
        });
        
        form.reset();
        setIsSubmitting(false);
    }, 500);
  }
  
  async function handleDelete(id: string) {
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast({
        title: 'Material Deleted (Mock)',
        description: 'The study material has been removed from the local list.'
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Add Study Material</CardTitle>
                <CardDescription>Upload a PDF link or create a note.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Thermodynamics Notes" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Physics" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Note">Note</SelectItem>
                                <SelectItem value="PDF">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{materialType === 'PDF' ? 'PDF URL' : 'Note Content'}</FormLabel>
                        <FormControl>
                            {materialType === 'PDF' ? (
                                <Input placeholder="https://example.com/document.pdf" {...field} />
                            ) : (
                                <Textarea placeholder="Write your notes here..." {...field} rows={8} />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                  Add Material
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Existing Materials</CardTitle>
                <CardDescription>Manage uploaded study content.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials?.length === 0 ? (
                             <TableRow><TableCell colSpan={5} className="text-center h-24">No materials found.</TableCell></TableRow>
                        ) : (
                            materials?.map(material => (
                                <TableRow key={material.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {material.type === 'PDF' ? <FileText className="text-red-500" /> : <Book className="text-blue-500" />}
                                        {material.title}
                                    </TableCell>
                                    <TableCell><Badge variant={material.type === 'PDF' ? 'destructive' : 'secondary'}>{material.type}</Badge></TableCell>
                                    <TableCell>{material.subject}</TableCell>
                                    <TableCell>{material.createdAt ? format(material.createdAt.seconds * 1000, 'PP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                       <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Trash2 className="text-destructive" /></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the material. (Mock Action)
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDelete(material.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
