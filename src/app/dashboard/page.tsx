'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; 
import { Loader2, Lock, PlayCircle, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Test } from '@/lib/types';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedBundles, setPurchasedBundles] = useState<string[]>(['demo_exam']); 
  
  // REPLACEMENT: Custom State to handle expansion instead of Accordion
  const [expandedExams, setExpandedExams] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const q = query(collection(db, 'tests'));
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

  const groupedData = tests.reduce((acc, test) => {
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

    if (subType === 'full') acc[category][examName].tests.full.push(test);
    else if (subType === 'subject') acc[category][examName].tests.subject.push(test);
    else acc[category][examName].tests.topic.push(test);

    return acc;
  }, {} as Record<string, Record<string, any>>);

  const categories = Object.keys(groupedData);
  const defaultTab = categories.length > 0 ? categories[0] : 'General';

  const handlePurchase = (e: React.MouseEvent, examName: string) => {
    e.stopPropagation(); // Prevents the card from toggling when clicking buy
    const confirmed = confirm(`Unlock ${examName} bundle for full access?`);
    if (confirmed) {
      setPurchasedBundles([...purchasedBundles, examName]);
      alert("Purchase Successful! Tests Unlocked.");
    }
  };

  // Toggle function for our custom card
  const toggleExam = (examName: string) => {
    setExpandedExams(prev => 
      prev.includes(examName) 
        ? prev.filter(name => name !== examName) 
        : [...prev, examName]
    );
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
              
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(groupedData[category]).map(([examName, bundle]: [string, any]) => {
                  const isUnlocked = bundle.price === 0 || purchasedBundles.includes(examName);
                  const isExpanded = expandedExams.includes(examName);
                  
                  const totalTests = 
                    (bundle.tests.full?.length || 0) + 
                    (bundle.tests.subject?.length || 0) + 
                    (bundle.tests.topic?.length || 0);

                  return (
                    <div key={examName} className="border rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200">
                      
                      {/* 1. CUSTOM HEADER (Replaces AccordionTrigger - No Crashes) */}
                      <div 
                        onClick={() => toggleExam(examName)}
                        className="flex w-full items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 select-none"
                      >
                          {/* Left: Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold">{examName}</h3>
                              {bundle.price > 0 && !isUnlocked && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Lock size={12} className="mr-1"/> Locked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 font-normal">{totalTests} Tests Included</p>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-4">
                            {!isUnlocked && (
                              <Button 
                                size="sm" 
                                onClick={(e) => handlePurchase(e, examName)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2"
                              >
                                <ShoppingCart size={16} /> Unlock
                              </Button>
                            )}

                            <div className="text-right">
                               {isUnlocked ? (
                                 <Badge className="bg-green-600 hover:bg-green-700">Purchased</Badge>
                               ) : (
                                 <Badge variant="outline" className="border-gray-400">
                                   {bundle.price === 0 ? "Free" : `₹${bundle.price}`}
                                 </Badge>
                               )}
                            </div>

                            {/* Arrow Icon */}
                            {isExpanded ? <ChevronUp className="text-gray-400 h-5 w-5"/> : <ChevronDown className="text-gray-400 h-5 w-5"/>}
                          </div>
                      </div>

                      {/* 2. CUSTOM CONTENT (Replaces AccordionContent) */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50/50">
                          
                          {/* Locked Banner */}
                          {!isUnlocked && bundle.price > 0 && (
                             <div className="p-6 bg-yellow-50/50 border-b flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-yellow-800">
                                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Lock size={20} />
                                  </div>
                                  <div>
                                    <p className="font-semibold">Unlock Full Access</p>
                                    <p className="text-sm opacity-90">Get access to all {totalTests} tests in this bundle.</p>
                                  </div>
                                </div>
                                <Button onClick={(e) => handlePurchase(e, examName)} className="bg-yellow-600 hover:bg-yellow-700 text-white w-full md:w-auto">
                                  Pay ₹{bundle.price} Now
                                </Button>
                             </div>
                          )}

                          {/* Tests List */}
                          <div className="p-6 space-y-6">
                            {bundle.tests.full.length > 0 && (
                              <TestSection title="🏆 Full Mock Tests" tests={bundle.tests.full} isUnlocked={isUnlocked} router={router} />
                            )}
                            {bundle.tests.subject.length > 0 && (
                              <TestSection title="📚 Subject Wise Tests" tests={bundle.tests.subject} isUnlocked={isUnlocked} router={router} />
                            )}
                            {bundle.tests.topic.length > 0 && (
                              <TestSection title="📝 Topic Wise Practice" tests={bundle.tests.topic} isUnlocked={isUnlocked} router={router} />
                            )}
                            {totalTests === 0 && <p className="text-gray-400 italic text-center py-4">No tests added to this bundle yet.</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Helper Component (Includes Safety Check for Missing Questions)
function TestSection({ title, tests, isUnlocked, router }: any) {
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 font-semibold border-b text-gray-700 text-sm uppercase tracking-wide">{title}</div>
      <div className="divide-y">
        {tests?.map((test: any) => (
          <div key={test.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-900">{test.title}</p>
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                {/* SAFE CHECK for missing 'questions' array to prevent length error */}
                <span>{test.questions?.length || 0} Questions</span> • <span>{test.duration} mins</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              disabled={!isUnlocked} 
              onClick={() => router.push(`/dashboard/tests/${test.id}`)}
              className={isUnlocked ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {isUnlocked ? <><PlayCircle size={16} className="mr-2"/> Start</> : <><Lock size={16} className="mr-2"/> Locked</>}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

    