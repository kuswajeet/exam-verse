'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
} from "@/components/ui/alert-dialog"

const materialSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  subject: z.string().min(3, 'Subject is too short'),
  type: z.enum(['PDF', 'Note']),
  content: z.string().min(10, 'Content is too short'),
});

type MaterialForm = z.infer<typeof materialSchema>;

export default function ManageMaterialsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materialsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'materials'), orderBy('createdAt', 'desc')) : null, 
    [firestore]
  );
  const { data: materials, isLoading, error } = useCollection<Material>(materialsQuery);

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
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'materials'), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Success!',
        description: 'New study material has been added.',
        className: 'bg-green-100 dark:bg-green-900',
      });
      form.reset();
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add study material.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleDelete(id: string) {
    if(!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'materials', id));
        toast({
            title: 'Material Deleted',
            description: 'The study material has been removed.'
        })
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete material.'
        })
    }
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
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Loading materials...</TableCell></TableRow>
                        ) : error ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-red-500 h-24">Error loading materials.</TableCell></TableRow>
                        ) : materials?.length === 0 ? (
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
                                    <TableCell>{material.createdAt ? format(material.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                       <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Trash2 className="text-destructive" /></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the material.
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

    