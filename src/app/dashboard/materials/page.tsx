
'use client';

import { useState, useMemo } from 'react';
import { getMockMaterials } from '@/lib/mock-data';
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
import { useEffect } from 'react';

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<Omit<Material, 'createdAt'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Omit<Material, 'createdAt'> | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getMockMaterials();
      setMaterials(data);
      setIsLoading(false);
    }
    loadData();
  }, []);
  
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

  const getEmbeddablePdfUrl = (url: string) => {
    if (url.includes("drive.google.com")) {
      // Handles links like "drive.google.com/file/d/.../view"
      return url.replace("/view", "/preview");
    }
    // For direct PDF links, this helps hide toolbars in some browsers
    return `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  };

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
             <Dialog key={material.id} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
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
                            {material.type === 'PDF' ? 'This is a PDF document. Click to open.' : material.content}
                        </p>
                    </CardContent>
                    <CardFooter>
                         <DialogTrigger asChild>
                            <Button variant={material.type === 'PDF' ? 'default' : 'outline'} className="w-full" onClick={() => setSelectedMaterial(material)}>
                                {material.type === 'PDF' ? 'Open PDF' : 'Read Note'}
                            </Button>
                        </DialogTrigger>
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

       {selectedMaterial && (
        <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
            <DialogContent className={selectedMaterial.type === 'PDF' ? 'max-w-none w-[90vw] h-[90vh] flex flex-col' : 'sm:max-w-2xl'}>
                 <DialogHeader>
                    <DialogTitle>{selectedMaterial.title}</DialogTitle>
                    <DialogDescription>{selectedMaterial.subject}</DialogDescription>
                </DialogHeader>
                {selectedMaterial.type === 'Note' ? (
                    <ScrollArea className="max-h-[60vh] mt-4">
                        <div className="prose dark:prose-invert whitespace-pre-wrap p-1">
                            {selectedMaterial.content}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex-grow mt-4">
                        <iframe
                            src={getEmbeddablePdfUrl(selectedMaterial.content)}
                            className="w-full h-full border-0"
                            title={selectedMaterial.title}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
