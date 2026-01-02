
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Lightbulb, Target, BookOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OneLinersPage() {
  const firestore = useFirestore();

  const [filters, setFilters] = useState({
    subject: 'all',
    topic: 'all',
    difficulty: 'all',
  });

  const oneLinersQuery = useMemoFirebase(() => 
    firestore 
      ? query(
          collection(firestore, 'questions'), 
          where('questionType', '==', 'one_liner'),
          limit(100) // Fetch a larger batch for client-side filtering
        )
      : null, 
    [firestore]
  );
  
  const { data: allQuestions, isLoading } = useCollection<Question>(oneLinersQuery);

  const { uniqueSubjects, uniqueTopics, uniqueDifficulties } = useMemo(() => {
    if (!allQuestions) return { uniqueSubjects: [], uniqueTopics: [], uniqueDifficulties: [] };
    const subjectSet = new Set<string>();
    const topicSet = new Set<string>();
    const difficultySet = new Set<string>();
    allQuestions.forEach(q => {
      if(q.subject) subjectSet.add(q.subject);
      if(q.topic) topicSet.add(q.topic);
      if(q.difficulty) difficultySet.add(q.difficulty);
    });
    return {
      uniqueSubjects: ['all', ...Array.from(subjectSet).sort()],
      uniqueTopics: ['all', ...Array.from(topicSet).sort()],
      uniqueDifficulties: ['all', ...Array.from(difficultySet)],
    };
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!allQuestions) return [];
    return allQuestions.filter(q => 
      (filters.subject === 'all' || q.subject === filters.subject) &&
      (filters.topic === 'all' || q.topic === filters.topic) &&
      (filters.difficulty === 'all' || q.difficulty === filters.difficulty)
    );
  }, [allQuestions, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const resetFilters = () => {
    setFilters({ subject: 'all', topic: 'all', difficulty: 'all' });
  };
  
  if (!isLoading && (!allQuestions || allQuestions.length === 0)) {
    return (
        <Card className="max-w-2xl mx-auto mt-10 text-center">
            <CardHeader>
                <CardTitle>No "One-Liner" Questions Found</CardTitle>
                <CardDescription>
                    We couldn't find any questions marked as 'one_liner'. Admins can add some in the question management section.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>One-Liner Practice</CardTitle>
                <CardDescription>Quickly revise key concepts. Click a question to reveal the answer.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <Select value={filters.subject} onValueChange={(v) => handleFilterChange('subject', v)}>
                    <SelectTrigger><SelectValue placeholder="All Subjects"/></SelectTrigger>
                    <SelectContent>{uniqueSubjects.map(s => <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All Subjects' : s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filters.topic} onValueChange={(v) => handleFilterChange('topic', v)}>
                    <SelectTrigger><SelectValue placeholder="All Topics"/></SelectTrigger>
                    <SelectContent>{uniqueTopics.map(t => <SelectItem key={t} value={t} className="capitalize">{t === 'all' ? 'All Topics' : t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filters.difficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}>
                    <SelectTrigger><SelectValue placeholder="All Difficulties"/></SelectTrigger>
                    <SelectContent>{uniqueDifficulties.map(d => <SelectItem key={d} value={d} className="capitalize">{d === 'all' ? 'All Difficulties' : d}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={resetFilters}><X className="mr-2 h-4 w-4"/>Clear</Button>
            </CardContent>
        </Card>

        {isLoading ? (
            <div className="space-y-4">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
                {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                    <AccordionItem value={q.id} key={q.id} className="border bg-card rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                           <div className="flex-1 space-y-2">
                             <p className="font-semibold">{q.questionText}</p>
                             <div className="flex items-center gap-2">
                                <Badge variant="secondary">{q.topic}</Badge>
                                <Badge variant={q.difficulty === 'hard' ? 'destructive' : 'outline'}>{q.difficulty}</Badge>
                                {q.sourceExamName && q.previousYear && (
                                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/50 dark:text-yellow-200">
                                        <Target className="mr-2 h-3 w-3" />
                                        {q.sourceExamName} {q.previousYear}
                                    </Badge>
                                )}
                             </div>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-3">
                             <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                                <Eye className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-green-800 dark:text-green-300">Answer</h4>
                                    <p className="text-sm text-green-700 dark:text-green-400">{q.options[0]}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Explanation</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">{q.explanation}</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Questions Match Filters</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters to find more questions.</p>
                        </CardContent>
                    </Card>
                )}
            </Accordion>
        )}
    </div>
  );
}
