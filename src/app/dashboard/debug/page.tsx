'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal, ShieldCheck, ShieldOff, Database, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Test } from '@/lib/types';

interface DiagnosticResult {
  status: 'success' | 'error';
  testCount: number;
  resultCount: number;
  firstTest: Test | null;
  loadTime: number;
  errorMessage?: string;
}

export default function DebugPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleRunDiagnostics = async () => {
    if (!firestore) {
      setResult({
        status: 'error',
        testCount: 0,
        resultCount: 0,
        firstTest: null,
        loadTime: 0,
        errorMessage: 'Firestore is not initialized.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    const startTime = performance.now();

    try {
      const testsRef = collection(firestore, 'tests');
      const resultsRef = collection(firestore, 'results');

      const [testsSnapshot, resultsSnapshot] = await Promise.all([
        getDocs(testsRef),
        getDocs(resultsRef),
      ]);
      
      const testsData = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Test[];
      const firstTest = testsData.length > 0 ? testsData[0] : null;

      const endTime = performance.now();

      setResult({
        status: 'success',
        testCount: testsSnapshot.size,
        resultCount: resultsSnapshot.size,
        firstTest: firstTest,
        loadTime: endTime - startTime,
      });

    } catch (error: any) {
      const endTime = performance.now();
      setResult({
        status: 'error',
        testCount: 0,
        resultCount: 0,
        firstTest: null,
        loadTime: endTime - startTime,
        errorMessage: error.message || 'An unknown error occurred.',
      });
      console.error("Diagnostic Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Diagnostics</CardTitle>
          <CardDescription>
            A tool to verify Firebase connection, authentication, and data integrity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunDiagnostics} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Diagnostics
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Status Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    {isUserLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : user ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldOff className="h-5 w-5 text-red-500" />}
                    <span className="font-medium">Authentication Status</span>
                </div>
                {isUserLoading ? (
                    <Badge variant="outline">Checking...</Badge>
                ) : user ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Yes (UID: {user.uid})
                    </Badge>
                ) : (
                     <Badge variant="destructive">No</Badge>
                )}
            </div>

            {result && (
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Timer className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Firestore Load Time</span>
                    </div>
                    <Badge variant="secondary">{result.loadTime.toFixed(0)} ms</Badge>
                </div>
            )}
        </CardContent>
      </Card>

      {result && result.status === 'error' && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Fetch Error</AlertTitle>
          <AlertDescription>
            Could not fetch data from Firestore. This often indicates a Security Rule is blocking the request.
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-xs text-muted-foreground">
                {result.errorMessage}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {result && result.status === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Total Tests Found</span>
                </div>
                <Badge variant="outline">{result.testCount}</Badge>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Total Results Found</span>
                </div>
                <Badge variant="outline">{result.resultCount}</Badge>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">First Test Document Structure</h3>
              <div className="rounded-lg bg-muted p-4">
                <pre className="text-xs font-mono overflow-x-auto">
                  {result.firstTest 
                    ? JSON.stringify(result.firstTest, null, 2)
                    : "No test documents found in the 'tests' collection."
                  }
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
