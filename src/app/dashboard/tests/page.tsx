'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Test } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Lock, FileText, View, ShoppingCart, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type GroupedExams = {
  [category: string]: {
    [examName: string]: {
      tests: {
        full: Test[];
        subject: Test[];
        topic: Test[];
      };
      bundlePrice: number;
      totalTests: number;
    };
  };
};

export default function TestsPage() {
  const firestore = useFirestore();
  const router = useRouter();

  // Mock state for purchased exams
  const [purchasedBundles, setPurchasedBundles] = useState<Set<string>>(new Set(['jee-main']));

  const testsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "tests")) : null),
    [firestore]
  );
  const { data: allTests, isLoading: isLoadingTests } = useCollection<Test>(testsQuery);

  const { groupedExams, categories } = useMemo(() => {
    if (!allTests) return { groupedExams: {}, categories: [] };

    const grouped: GroupedExams = {};

    allTests.forEach(test => {
      const category = test.category || 'General';
      const examName = test.examName || 'General Practice';
      const subType = test.testSubType || 'topic';

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][examName]) {
        grouped[category][examName] = {
          tests: { full: [], subject: [], topic: [] },
          bundlePrice: 0,
          totalTests: 0,
        };
      }
      
      const examGroup = grouped[category][examName];
      examGroup.totalTests += 1;
      
      // The first non-zero examPrice found becomes the bundle price
      if (examGroup.bundlePrice === 0 && test.examPrice && test.examPrice > 0) {
        examGroup.bundlePrice = test.examPrice;
      }

      if (subType === 'full') examGroup.tests.full.push(test);
      else if (subType === 'subject') examGroup.tests.subject.push(test);
      else examGroup.tests.topic.push(test);
    });
    
    return { groupedExams: grouped, categories: Object.keys(grouped).sort() };
  }, [allTests]);

  const handlePurchase = (examName: string, price: number) => {
    const confirmed = confirm(`Unlock the "${examName}" bundle for ₹${price}?`);
    if (confirmed) {
      setPurchasedBundles(prev => new Set(prev).add(examName));
      alert("Purchase Successful! Tests Unlocked.");
    }
  };
  
  if (isLoadingTests) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length: 3}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                        <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Test Series</CardTitle>
          <CardDescription>
            Select an exam bundle to view full mock tests, subject tests, and topic practice.
          </CardDescription>
        </CardHeader>
      </Card>

      {categories.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted">
            <p>No tests available right now. An admin needs to create some!</p>
          </div>
      ) : (
        <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList>
            {categories.map(category => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
            </TabsList>
            {categories.map(category => (
            <TabsContent key={category} value={category}>
                <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {Object.entries(groupedExams[category] || {}).map(([examName, bundle]) => {
                    const isPurchased = purchasedBundles.has(examName) || bundle.bundlePrice === 0;
                    const totalTests = bundle.totalTests;

                    return (
                        <AccordionItem key={examName} value={examName} className="border rounded-lg bg-card shadow-sm">
                            <Card className="flex flex-col border-0 shadow-none">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{examName}</CardTitle>
                                            <CardDescription>{totalTests} Total Tests</CardDescription>
                                        </div>
                                        {bundle.bundlePrice > 0 ? (
                                            <Badge variant={isPurchased ? 'default' : 'secondary'} className={isPurchased ? "bg-green-600 hover:bg-green-700" : ""}>
                                                {isPurchased ? "Purchased" : `₹${bundle.bundlePrice}`}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex items-center gap-3">
                                     {!isPurchased && (
                                        <Button onClick={() => handlePurchase(examName, bundle.bundlePrice)} className="flex-1 bg-accent hover:bg-accent/90">
                                            <ShoppingCart size={16} /> Unlock Bundle
                                        </Button>
                                    )}
                                    <AccordionTrigger className="flex-1 hover:no-underline p-0 decoration-0" asChild>
                                        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer">
                                          <View size={16} /> {isPurchased ? "View Tests" : "View Contents"}
                                        </span>
                                    </AccordionTrigger>
                                </CardFooter>
                            </Card>

                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-6">
                                    {bundle.tests.full.length > 0 && <TestSection title="🏆 Full Mock Tests" tests={bundle.tests.full} isUnlocked={isPurchased} router={router} />}
                                    {bundle.tests.subject.length > 0 && <TestSection title="📚 Subject Wise Tests" tests={bundle.tests.subject} isUnlocked={isPurchased} router={router} />}
                                    {bundle.tests.topic.length > 0 && <TestSection title="📝 Topic Wise Practice" tests={bundle.tests.topic} isUnlocked={isPurchased} router={router} />}
                                    {totalTests === 0 && <p className="text-muted-foreground italic text-center">No tests added to this bundle yet.</p>}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
                </Accordion>
            </TabsContent>
            ))}
        </Tabs>
      )}
    </div>
  );
}

function TestSection({ title, tests, isUnlocked, router }: { title: string; tests: Test[]; isUnlocked: boolean; router: any; }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted px-4 py-2 font-semibold border-b text-card-foreground">{title}</div>
      <div className="divide-y">
        {tests.map((test: Test) => (
          <div key={test.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium">{test.title}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span>{test.questionCount || 0} Questions</span> • <span>{test.durationMinutes} mins</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant={isUnlocked ? "default" : "secondary"}
              disabled={!isUnlocked} 
              onClick={() => router.push(`/dashboard/tests/${test.id}`)}
            >
              {isUnlocked ? <><PlayCircle size={16} /> Start</> : <><Lock size={16} /> Locked</>}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
