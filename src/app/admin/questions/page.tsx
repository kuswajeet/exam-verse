
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, PlusCircle, Trash2, Zap, Search, X, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Question } from '@/lib/types';


// --- MOCK DATA ---
const MOCK_QUESTIONS_LIST: Question[] = [
  {
    id: 'sample-mcq-1',
    questionText: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctAnswerIndex: 1,
    explanation: 'Mercury is the smallest planet in our solar system and the closest to the Sun.',
    category: 'General',
    examName: 'SAT',
    subject: 'Astronomy',
    topic: 'Solar System',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sample-mcq-2',
    questionText: 'What is the largest organ in the human body?',
    options: ['Liver', 'Brain', 'Skin', 'Heart'],
    correctAnswerIndex: 2,
    explanation: 'The skin is the largest organ of the body, with a total area of about 20 square feet.',
    category: 'Medical',
    examName: 'NEET',
    subject: 'Biology',
    topic: 'Human Anatomy',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
    {
    id: 'sample-ol-1',
    questionText: 'What is the powerhouse of the cell?',
    options: ['Mitochondria'],
    correctAnswerIndex: 0,
    explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.",
    category: 'Medical',
    examName: 'NEET',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
  {
    id: 'sample-ol-2',
    questionText: 'What force keeps planets in orbit around the sun?',
    options: ['Gravity'],
    correctAnswerIndex: 0,
    explanation: 'Gravity is the fundamental force of attraction that governs the motion of planets and stars.',
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Physics',
    topic: 'Gravitation',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
  {
    id: 'sample-mcq-3',
    questionText: 'What is the value of x in 2x + 3 = 11?',
    options: ['2', '3', '4', '5'],
    correctAnswerIndex: 2,
    explanation: '2x = 8, so x = 4.',
    category: 'Engineering',
    examName: 'JEE Main',
    subject: 'Math',
    topic: 'Algebra',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sample-mcq-4',
    questionText: 'Who wrote "1984"?',
    options: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'Philip K. Dick'],
    correctAnswerIndex: 1,
    explanation: 'George Orwell\'s dystopian novel "1984" was published in 1949.',
    category: 'General',
    examName: 'SAT',
    subject: 'Literature',
    topic: '20th Century Lit',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
  {
    id: 'sample-ol-3',
    questionText: 'What is the chemical symbol for gold?',
    options: ['Au'],
    correctAnswerIndex: 0,
    explanation: 'The chemical symbol for gold is Au, from the Latin word "aurum".',
    category: 'Science',
    examName: 'General',
    subject: 'Chemistry',
    topic: 'Elements',
    difficulty: 'easy',
    questionType: 'one_liner',
  },
  {
    id: 'sample-mcq-5',
    questionText: 'Which country is known as the Land of the Rising Sun?',
    options: ['China', 'South Korea', 'Japan', 'Thailand'],
    correctAnswerIndex: 2,
    explanation: 'Japan is often called the "Land of the Rising Sun" because its name in Japanese can be translated this way.',
    category: 'General',
    examName: 'General',
    subject: 'Geography',
    topic: 'World Geography',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sample-mcq-6',
    questionText: 'How many bones are in the adult human body?',
    options: ['206', '208', '210', '212'],
    correctAnswerIndex: 0,
    explanation: 'The adult human skeleton is composed of 206 bones.',
    category: 'Medical',
    examName: 'NEET',
    subject: 'Biology',
    topic: 'Anatomy',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
  {
    id: 'sample-ol-4',
    questionText: 'What is the hardest natural substance on Earth?',
    options: ['Diamond'],
    correctAnswerIndex: 0,
    explanation: 'Diamond is the hardest known natural material, rating 10 on the Mohs scale.',
    category: 'Science',
    examName: 'General',
    subject: 'Geology',
    topic: 'Minerals',
    difficulty: 'hard',
    questionType: 'one_liner',
  },
];
// --- END MOCK DATA ---

export default function ManageQuestionsPage() {
  const { toast } = useToast();
  
  // State
  const [allQuestions, setAllQuestions] = useState<Question[]>(MOCK_QUESTIONS_LIST);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ topic: 'all', difficulty: 'all', type: 'all' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized lists for filters and display
  const { topics, difficulties, types } = useMemo(() => {
    const topicSet = new Set<string>();
    const difficultySet = new Set<string>();
    const typeSet = new Set<string>();
    MOCK_QUESTIONS_LIST.forEach(q => {
      if(q.topic) topicSet.add(q.topic);
      if(q.difficulty) difficultySet.add(q.difficulty);
      if(q.questionType) typeSet.add(q.questionType);
    });
    return { 
      topics: ['all', ...Array.from(topicSet).sort()],
      difficulties: ['all', ...Array.from(difficultySet)],
      types: ['all', ...Array.from(typeSet)]
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => 
      (q.questionText.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.topic === 'all' || q.topic === filters.topic) &&
      (filters.difficulty === 'all' || q.difficulty === filters.difficulty) &&
      (filters.type === 'all' || q.questionType === filters.type)
    );
  }, [allQuestions, searchTerm, filters]);
  
  // Handlers
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ topic: 'all', difficulty: 'all', type: 'all' });
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };
  
  const handleDeleteSelected = () => {
    setAllQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
    toast({ title: "Success", description: `${selectedIds.size} questions deleted. (Mock)` });
    setSelectedIds(new Set());
  };

  const handleDeleteRow = (id: string) => {
    setAllQuestions(prev => prev.filter(q => q.id !== id));
    toast({ title: "Success", description: `Question deleted. (Mock)` });
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion({ ...question });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    alert("Edit feature coming soon!");
    // This is where you would update the local state:
    // setAllQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
    // toast({ title: 'Success', description: 'Question updated successfully. (Mock)' });
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleSeedData = () => {
    setAllQuestions(MOCK_QUESTIONS_LIST);
    toast({
        title: 'Success!',
        description: `${MOCK_QUESTIONS_LIST.length} sample questions have been loaded.`,
        className: 'bg-green-100 dark:bg-green-900',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Manage Questions</CardTitle>
              <CardDescription>View, filter, edit, or delete all questions in the database.</CardDescription>
            </div>
            <div className="flex gap-2">
                {selectedIds.size > 0 && (
                    <Button variant="destructive" onClick={handleDeleteSelected}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedIds.size})
                    </Button>
                )}
                 <Button onClick={handleSeedData}>
                  <Zap className="mr-2 h-4 w-4" />
                  Load Mock Data
                </Button>
            </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by question text..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filters.topic} onValueChange={(v) => handleFilterChange('topic', v)}><SelectTrigger><SelectValue placeholder="All Topics"/></SelectTrigger><SelectContent>{topics.map(t => <SelectItem key={t} value={t} className="capitalize">{t === 'all' ? 'All Topics' : t}</SelectItem>)}</SelectContent></Select>
            <Select value={filters.difficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}><SelectTrigger><SelectValue placeholder="All Difficulties"/></SelectTrigger><SelectContent>{difficulties.map(d => <SelectItem key={d} value={d} className="capitalize">{d === 'all' ? 'All Difficulties' : d}</SelectItem>)}</SelectContent></Select>
            <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}><SelectTrigger><SelectValue placeholder="All Types"/></SelectTrigger><SelectContent>{types.map(t => <SelectItem key={t} value={t} className="capitalize">{t === 'all' ? 'All Types' : t}</SelectItem>)}</SelectContent></Select>
        </div>
         { (searchTerm || filters.topic !== 'all' || filters.difficulty !== 'all' || filters.type !== 'all') && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-4"><X className="mr-2 h-4 w-4"/>Clear Filters</Button>
         )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length} /></TableHead>
              <TableHead className="w-[40%]">Question Text</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">Loading questions...</TableCell></TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">No questions found. Try loading mock data.</TableCell></TableRow>
            ) : (
              filteredQuestions.map(question => (
                <TableRow key={question.id} data-state={selectedIds.has(question.id) ? 'selected' : ''}>
                  <TableCell><Checkbox onCheckedChange={(checked) => handleRowSelect(question.id, !!checked)} checked={selectedIds.has(question.id)} /></TableCell>
                  <TableCell className="font-medium max-w-sm truncate">{question.questionText}</TableCell>
                  <TableCell><Badge variant={question.questionType === 'one_liner' ? 'outline' : 'secondary'}>{question.questionType}</Badge></TableCell>
                  <TableCell>{question.topic}</TableCell>
                  <TableCell><Badge variant={question.difficulty === 'hard' ? 'destructive' : 'secondary'}>{question.difficulty}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => alert('Edit feature coming soon!')}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid gap-2">
                <Label htmlFor="q-text">Question Text</Label>
                <Textarea id="q-text" value={editingQuestion.questionText} onChange={e => setEditingQuestion({...editingQuestion, questionText: e.target.value})} rows={3} />
              </div>
              
              {editingQuestion.questionType === 'single_choice' ? (
                <>
                  <Label>Options</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {editingQuestion.options.map((opt, index) => (
                      <Input key={index} value={opt} onChange={e => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;
                        setEditingQuestion({...editingQuestion, options: newOptions });
                      }} />
                    ))}
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="correct-index">Correct Answer Index</Label>
                      <Select value={editingQuestion.correctAnswerIndex.toString()} onValueChange={v => setEditingQuestion({...editingQuestion, correctAnswerIndex: parseInt(v)})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {editingQuestion.options.map((_, index) => <SelectItem key={index} value={index.toString()}>{`Option ${index + 1}`}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                </>
              ) : (
                 <div className="grid gap-2">
                    <Label htmlFor="one-liner-answer">Correct Answer</Label>
                    <Input id="one-liner-answer" value={editingQuestion.options[0]} onChange={e => setEditingQuestion({...editingQuestion, options: [e.target.value]})}/>
                 </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea id="explanation" value={editingQuestion.explanation} onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" value={editingQuestion.topic} onChange={e => setEditingQuestion({...editingQuestion, topic: e.target.value})} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                     <Select value={editingQuestion.difficulty} onValueChange={v => setEditingQuestion({...editingQuestion, difficulty: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                     <Select value={editingQuestion.questionType} onValueChange={v => setEditingQuestion({...editingQuestion, questionType: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="single_choice">Multiple Choice</SelectItem>
                            <SelectItem value="one_liner">One Liner</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    