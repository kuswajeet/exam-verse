'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, FileText, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StudyMaterialsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Material | null>(null);
  
  const materialsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'materials'), orderBy('createdAt', 'desc')) : null, 
    [firestore]
  );
  const { data: materials, isLoading } = useCollection<Material>(materialsQuery);

  const uniqueSubjects = useMemo(() => {
    if (!materials) return [];
    return ['All', ...Array.from(new Set(materials.map(m => m.subject)))];
  }, [materials]);
  
  const [activeSubject, setActiveSubject] = useState('All');

  const filteredMaterials = useMemo(() => {
    return materials?.filter(material => {
      const subjectMatch = activeSubject === 'All' || material.subject === activeSubject;
      const searchMatch = searchTerm === '' || material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return subjectMatch && searchMatch;
    }) ?? [];
  }, [materials, activeSubject, searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Study Materials</CardTitle>
          <CardDescription>Browse notes and documents to aid your preparation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by title or subject..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
             <div className="flex flex-wrap items-center gap-2">
                {uniqueSubjects.map(subject => (
                    <Button 
                        key={subject} 
                        variant={activeSubject === subject ? 'default' : 'outline'}
                        onClick={() => setActiveSubject(subject)}
                    >
                        {subject}
                    </Button>
                ))}
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
            Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => (
             <Dialog key={material.id} onOpenChange={(open) => !open && setSelectedNote(null)}>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-start gap-3">
                           {material.type === 'PDF' ? <FileText className="h-6 w-6 text-red-500 mt-1" /> : <Book className="h-6 w-6 text-blue-500 mt-1" />}
                           <span className="flex-1">{material.title}</span>
                        </CardTitle>
                        <CardDescription>{material.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {material.type === 'PDF' ? 'This is a PDF document. Click to open in a new tab.' : material.content}
                        </p>
                    </CardContent>
                    <CardFooter>
                         {material.type === 'PDF' ? (
                            <Button asChild className="w-full">
                                <a href={material.content} target="_blank" rel="noopener noreferrer">Open PDF</a>
                            </Button>
                         ) : (
                             <DialogTrigger asChild>
                                <Button variant="outline" className="w-full" onClick={() => setSelectedNote(material)}>Read Note</Button>
                            </DialogTrigger>
                         )}
                    </CardFooter>
                </Card>
             </Dialog>
          ))
        ) : (
            <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No study materials match your criteria.</p>
            </div>
        )}
      </div>

       {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>{selectedNote.title}</DialogTitle>
                    <DialogDescription>{selectedNote.subject}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] mt-4">
                    <div className="prose dark:prose-invert whitespace-pre-wrap p-1">
                        {selectedNote.content}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

    