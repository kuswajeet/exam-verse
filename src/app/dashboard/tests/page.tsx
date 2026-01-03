'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { Loader2, Lock, Unlock, ChevronDown, PlayCircle, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Test } from '@/lib/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedBundles, setPurchasedBundles] = useState<string[]>(['demo_exam']); // Mock user purchases
  const router = useRouter();

  // 1. Fetch Data
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const q = query(collection(db, 'tests')); // Fetch ALL tests
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // 2. Grouping Logic (The Brains)
  const groupedData = tests.reduce((acc, test) => {
    // Fallbacks for old data
    const category = test.category || "General";
    const examName = test.examName || "General Practice";
    const subType = test.testSubType || "topic"; 

    if (!acc[category]) acc[category] = {};
    if (!acc[category][examName]) {
      acc[category][examName] = {
        price: test.examPrice || 0,
        tests: { full: [], subject: [], topic: [] }
      };
    }

    // Sort into sub-types
    if (subType === 'full') acc[category][examName].tests.full.push(test);
    else if (subType === 'subject') acc[category][examName].tests.subject.push(test);
    else acc[category][examName].tests.topic.push(test); // Default to topic

    return acc;
  }, {} as Record<string, Record<string, any>>);

  const categories = Object.keys(groupedData);
  const defaultTab = categories.length > 0 ? categories[0] : 'General';

  // 3. Purchase Handler (Mock)
  const handlePurchase = (e: React.MouseEvent, examName: string) => {
    e.stopPropagation();
    const confirmed = confirm(`Unlock ${examName} bundle for full access?`);
    if (confirmed) {
      setPurchasedBundles([...purchasedBundles, examName]);
      alert("Purchase Successful! Tests Unlocked.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Exam Series</h1>
        <p className="text-gray-500">Select an exam bundle to view full mock tests, subject tests, and topic practice.</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-gray-50">
          <p>No tests available right now. Admin needs to create some!</p>
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-6">
              {Object.entries(groupedData[category] || {}).map(([examName, bundle]: [string, any]) => {
                const isUnlocked = bundle.price === 0 || purchasedBundles.includes(examName);
                const totalTests = (bundle.tests.full?.length || 0) + (bundle.tests.subject?.length || 0) + (bundle.tests.topic?.length || 0);

                return (
                  <Collapsible key={examName} className="border rounded-lg bg-card shadow-sm">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-t-lg">
                       <div className="text-left space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold">{examName}</h3>
                            {bundle.price > 0 && !isUnlocked && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Lock size={12} className="mr-1"/> Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-normal">{totalTests} Tests Included</p>
                        </div>
                        <div className="flex items-center gap-4">
                           {!isUnlocked && bundle.price > 0 && (
                            <Button 
                              size="sm" 
                              onClick={(e) => handlePurchase(e, examName)}
                              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 hidden md:flex"
                            >
                              <ShoppingCart size={16} /> Unlock for ₹{bundle.price}
                            </Button>
                          )}
                          {isUnlocked && (
                             <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Purchased</Badge>
                          )}
                          <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-t">
                      <div className="p-4 space-y-4 bg-muted/50">
                        {bundle.tests.full.length > 0 && (
                          <TestSection title="🏆 Full Mock Tests" tests={bundle.tests.full} isUnlocked={isUnlocked} router={router} />
                        )}
                        {bundle.tests.subject.length > 0 && (
                          <TestSection title="📚 Subject Wise Tests" tests={bundle.tests.subject} isUnlocked={isUnlocked} router={router} />
                        )}
                        {bundle.tests.topic.length > 0 && (
                          <TestSection title="📝 Topic Wise Practice" tests={bundle.tests.topic} isUnlocked={isUnlocked} router={router} />
                        )}
                        {totalTests === 0 && <p className="text-muted-foreground italic text-center py-4">No tests added to this bundle yet.</p>}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Helper Component for the Lists
function TestSection({ title, tests, isUnlocked, router }: any) {
  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <div className="bg-secondary px-4 py-2 font-semibold border-b text-secondary-foreground text-sm">{title}</div>
      <div className="divide-y">
        {tests.map((test: any) => (
          <div key={test.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium">{test.title}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span>{test.questionCount || test.questionIds?.length || 0} Questions</span>
                <span>{test.durationMinutes} mins</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              disabled={!isUnlocked} 
              onClick={() => router.push(`/dashboard/tests/${test.id}`)}
              className={isUnlocked ? "bg-primary hover:bg-primary/90" : ""}
            >
              {isUnlocked ? <><PlayCircle size={16} className="mr-2"/> Start</> : <><Lock size={16} className="mr-2"/> Locked</>}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
