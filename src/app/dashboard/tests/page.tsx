
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Lock, PlayCircle, ShoppingCart, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Test, TestWithQuestions } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getMockTests } from '@/lib/mock-data';
import Link from 'next/link';


export default function TestsPage() {
  const [tests, setTests] = useState<TestWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Mock which bundles the user has 'purchased'.
  const [purchasedBundles, setPurchasedBundles] = useState<Set<string>>(new Set(['General Science Mock']));

  const router = useRouter();

  // 1. Fetch Data & Check Pro Status
  useEffect(() => {
    // Check pro status from localStorage
    const proStatus = localStorage.getItem('isPro') === 'true';
    setIsPro(proStatus);
    
    const fetchTests = async () => {
      setLoading(true);
      try {
        const allTests = await getMockTests();
        // Filter for main exams, not quizzes
        const examTests = allTests.filter(t => t.testType === 'exam');
        setTests(examTests);
      } catch (error) {
        console.error("Error fetching mock tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // 2. Grouping Logic
  const groupedData = useMemo(() => tests.reduce((acc, test) => {
    const category = test.category || "General";
    const examName = test.examName || "General Practice";

    if (!acc[category]) acc[category] = {};
    if (!acc[category][examName]) {
      acc[category][examName] = {
        price: test.examPrice || 0,
        tests: { full: [], subject: [], topic: [] }
      };
    }
    
    const subType = test.testSubType || 'topic';
    if (subType === 'full') acc[category][examName].tests.full.push(test);
    else if (subType === 'subject') acc[category][examName].tests.subject.push(test);
    else acc[category][examName].tests.topic.push(test);

    return acc;
  }, {} as Record<string, Record<string, any>>), [tests]);

  const categories = Object.keys(groupedData);
  const defaultTab = categories.length > 0 ? categories[0] : '';

  // 3. Purchase & Navigation Handlers
  const handlePurchase = (e: React.MouseEvent, examName: string) => {
    e.stopPropagation();
    const confirmed = confirm(`Unlock ${examName} bundle for full access?`);
    if (confirmed) {
      setPurchasedBundles(prev => new Set(prev).add(examName));
      alert("Purchase Successful! Tests Unlocked.");
    }
  };

  const handleStartTest = (test: Test) => {
    const isBundlePurchased = purchasedBundles.has(test.examName);
    const canAccess = isPro || test.isFree || isBundlePurchased;

    if (canAccess) {
      router.push(`/dashboard/tests/${test.id}`);
    } else {
      setShowUpgradeDialog(true);
    }
  };


  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Exam Series</h1>
        <p className="text-muted-foreground">Select an exam bundle to view full mock tests, subject tests, and topic practice.</p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-card/50">
          <p className="mb-4">No tests found in the database.</p>
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-1 sm:grid-cols-2 md:w-auto md:inline-flex">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              {Object.entries(groupedData[category] || {}).map(([examName, bundle]: [string, any]) => {
                const isBundlePurchased = purchasedBundles.has(examName);
                const isBundleFree = bundle.price === 0;
                const isUnlocked = isPro || isBundleFree || isBundlePurchased;
                
                const fullTests = bundle.tests.full || [];
                const subjectTests = bundle.tests.subject || [];
                const topicTests = bundle.tests.topic || [];
                const totalTests = fullTests.length + subjectTests.length + topicTests.length;

                return (
                  <Collapsible key={examName} className="border rounded-lg bg-card shadow-sm" defaultOpen={true}>
                    <div className="flex w-full items-center justify-between p-4 rounded-t-lg">
                      <CollapsibleTrigger asChild>
                         <div className="flex-grow flex items-center gap-4 cursor-pointer">
                            <div className="text-left space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{examName}</h3>
                                    {!isUnlocked && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"><Lock size={12} className="mr-1"/> Locked</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground font-normal">{totalTests} Tests Included</p>
                            </div>
                            <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                        </div>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-4 ml-4">
                           {!isUnlocked && (
                            <Button 
                              size="sm" 
                              onClick={(e) => handlePurchase(e, examName)}
                              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 hidden md:flex"
                            >
                              <ShoppingCart size={16} /> Unlock for ₹{bundle.price}
                            </Button>
                          )}
                          {isUnlocked && isBundlePurchased && !isBundleFree &&(
                             <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Purchased</Badge>
                          )}
                           {isUnlocked && isBundleFree &&(
                             <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Free</Badge>
                          )}
                        </div>
                    </div>
                    <CollapsibleContent className="border-t">
                      <div className="p-4 space-y-4 bg-muted/50">
                        {fullTests.length > 0 && <TestSection title="🏆 Full Mock Tests" tests={fullTests} onStartTest={handleStartTest} isPro={isPro} purchasedBundles={purchasedBundles} />}
                        {subjectTests.length > 0 && <TestSection title="📚 Subject Wise Tests" tests={subjectTests} onStartTest={handleStartTest} isPro={isPro} purchasedBundles={purchasedBundles} />}
                        {topicTests.length > 0 && <TestSection title="📝 Topic Wise Practice" tests={topicTests} onStartTest={handleStartTest} isPro={isPro} purchasedBundles={purchasedBundles} />}
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

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
            <AlertDialogDescription>
                This test is part of our premium collection. Unlock this and all other tests by upgrading to a Pro plan.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction asChild>
                <Link href="/dashboard/subscription">Upgrade Now</Link>
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper Component for the Lists
function TestSection({ title, tests, onStartTest, isPro, purchasedBundles }: { title: string; tests: Test[], onStartTest: (test: Test) => void, isPro: boolean, purchasedBundles: Set<string> }) {
  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <div className="bg-secondary px-4 py-2 font-semibold border-b text-secondary-foreground text-sm">{title}</div>
      <div className="divide-y">
        {tests.map((test: Test) => {
            const isBundlePurchased = purchasedBundles.has(test.examName);
            const canAccess = isPro || test.isFree || isBundlePurchased;

            return (
              <div key={test.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {test.title}
                    {!canAccess && <Lock size={14} className="text-amber-500" />}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>{test.questionCount || 0} Questions</span>
                    <span>{test.durationMinutes} mins</span>
                     {test.isFree ? <Badge variant="outline">Free</Badge> : <Badge variant="secondary">Pro</Badge>}
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => onStartTest(test)}
                >
                  {canAccess ? <><PlayCircle size={16} className="mr-2"/> Start</> : <><Lock size={16} className="mr-2"/> Locked</>}
                </Button>
              </div>
            )
        })}
      </div>
    </div>
  );
}
