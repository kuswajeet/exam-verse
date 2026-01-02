'use client';

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { Test } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lock, FileText, View } from "lucide-react";

type GroupedExams = {
  [category: string]: {
    [examName: string]: {
      tests: Test[];
      subTypes: {
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

  // Mock state for purchased exams
  const [purchasedExams, setPurchasedExams] = useState<Set<string>>(new Set(['jee-main']));

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
      const examName = test.examName || 'Unnamed Exam';

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][examName]) {
        grouped[category][examName] = {
          tests: [],
          subTypes: { full: [], subject: [], topic: [] },
          bundlePrice: 0,
          totalTests: 0,
        };
      }
      
      const examGroup = grouped[category][examName];
      examGroup.tests.push(test);
      examGroup.totalTests += 1;
      
      // The first non-zero examPrice found becomes the bundle price
      if (examGroup.bundlePrice === 0 && test.examPrice && test.examPrice > 0) {
        examGroup.bundlePrice = test.examPrice;
      }

      switch (test.testSubType) {
        case 'full':
          examGroup.subTypes.full.push(test);
          break;
        case 'subject':
          examGroup.subTypes.subject.push(test);
          break;
        case 'topic':
          examGroup.subTypes.topic.push(test);
          break;
        default:
          // Maybe push to a default/uncategorized list if needed
          break;
      }
    });
    
    return { groupedExams: grouped, categories: Object.keys(grouped) };
  }, [allTests]);

  const handleUnlockBundle = (examName: string) => {
    setPurchasedExams(prev => new Set(prev).add(examName));
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
                Choose a test series to start preparing. Good luck!
            </CardDescription>
            </CardHeader>
        </Card>
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Object.keys(groupedExams[category] || {}).map(examName => {
                const bundle = groupedExams[category][examName];
                const isPurchased = purchasedExams.has(examName) || bundle.bundlePrice === 0;

                return (
                  <Card key={examName} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{examName}</CardTitle>
                          <CardDescription>{bundle.totalTests} Total Tests</CardDescription>
                        </div>
                        <Badge variant={isPurchased ? "outline" : "default"}>
                          {bundle.bundlePrice > 0 ? `₹${bundle.bundlePrice}` : "Free"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Accordion type="multiple" className="w-full">
                        {bundle.subTypes.full.length > 0 && (
                          <AccordionItem value="full-mocks">
                            <AccordionTrigger>Full Mocks ({bundle.subTypes.full.length})</AccordionTrigger>
                            <AccordionContent>
                              <TestList tests={bundle.subTypes.full} isPurchased={isPurchased} />
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        {bundle.subTypes.subject.length > 0 && (
                          <AccordionItem value="subject-tests">
                            <AccordionTrigger>Subject Tests ({bundle.subTypes.subject.length})</AccordionTrigger>
                            <AccordionContent>
                              <TestList tests={bundle.subTypes.subject} isPurchased={isPurchased} />
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        {bundle.subTypes.topic.length > 0 && (
                          <AccordionItem value="topic-tests">
                            <AccordionTrigger>Topic Tests ({bundle.subTypes.topic.length})</AccordionTrigger>
                            <AccordionContent>
                               <TestList tests={bundle.subTypes.topic} isPurchased={isPurchased} />
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </CardContent>
                    <CardFooter>
                      {isPurchased ? (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`#`}>
                                <View className="mr-2" /> View Included Tests
                            </Link>
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handleUnlockBundle(examName)}>
                          <Lock className="mr-2" /> Unlock Bundle (₹{bundle.bundlePrice})
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Helper component to render a list of tests within an accordion
const TestList = ({ tests, isPurchased }: { tests: Test[], isPurchased: boolean }) => (
    <div className="space-y-2 pl-2">
        {tests.map(test => (
            <div key={test.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-medium">{test.title}</span>
                </div>
                {isPurchased ? (
                    <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/tests/${test.id}`}>Start</Link>
                    </Button>
                ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
        ))}
    </div>
)
