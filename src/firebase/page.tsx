'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; 
import { Loader2, Lock, PlayCircle, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
// NOTE: We use standard HTML elements, NO Accordion/Tabs libraries to prevent crashes.
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Test } from '@/lib/types';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedBundles, setPurchasedBundles] = useState<string[]>(['demo_exam']); 
  
  // Custom State for interactivity
  const [expandedExams, setExpandedExams] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const q = query(collection(db, 'tests'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
        setTests(data);
      } catch (error) {
        // Silently fail in production
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

  // Set default tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const handlePurchase = (e: React.MouseEvent, examName: string) => {
    e.stopPropagation(); 
    setPurchasedBundles([...purchasedBundles, examName]);
  };

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
        <p className="text-gray-500">Select an exam bundle to view full mock tests.</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-gray-50">
          <p>No tests available right now.</p>
        </div>
      ) : (
        <div className="w-full space-y-6">
          
          {/* MANUAL TABS */}
          <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === cat 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* EXAM LIST */}
          {activeTab && groupedData[activeTab] && (
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(groupedData[activeTab]).map(([examName, bundle]: [string, any]) => {
                const isUnlocked = bundle.price === 0 || purchasedBundles.includes(examName);
                const isExpanded = expandedExams.includes(examName);
                
                const totalTests = 
                  (bundle.tests.full?.length || 0) + 
                  (bundle.tests.subject?.length || 0) + 
                  (bundle.tests.topic?.length || 0);

                return (
                  <div key={examName} className="border rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200">
                    
                    {/* CARD HEADER (Standard Div) */}
                    <div 
                      onClick={() => toggleExam(examName)}
                      className="flex w-full items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 select-none"
                    >
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

                          {isExpanded ? <ChevronUp className="text-gray-400 h-5 w-5"/> : <ChevronDown className="text-gray-400 h-5 w-5"/>}
                        </div>
                    </div>

                    {/* EXPANDED CONTENT */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50/50">
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
          )}
        </div>
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
                {/* SAFE CHECK: test.questions?.length || 0 */}
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
