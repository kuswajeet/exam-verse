
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isPro, setIsPro] = useState(false);

  // 1. Fetch User Data
  useEffect(() => {
    // Check subscription status from localStorage
    const proStatus = localStorage.getItem('isPro') === 'true';
    setIsPro(proStatus);

    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(userSnap => {
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || '');
          setMobileNumber(data.mobileNumber || '');
        }
      }).catch(error => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your profile data.',
        });
      });
    }
  }, [user, firestore, toast]);

  // 2. Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      await updateDoc(userRef, {
        name: name,
        mobileNumber: mobileNumber,
      });

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
        className: 'bg-green-100 dark:bg-green-900',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your changes.',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancelSubscription = () => {
    // This is a mock action. In a real app, this would redirect to a Stripe/billing portal.
    toast({
        title: 'Mock Action',
        description: 'Subscription management coming soon!'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Account Settings</CardTitle>
          <CardDescription>Manage your profile and subscription details.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input 
                      id="phone" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      placeholder="e.g., 9876543210" 
                    />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
           <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star/> Your Plan
                </CardTitle>
             </CardHeader>
             <CardContent>
                 {isPro ? (
                    <div className="space-y-2">
                        <Badge className="bg-amber-400 text-amber-900">Pro Member</Badge>
                        <p className="text-lg font-semibold">You have access to all premium features. Thank you for your support!</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                        <Badge variant="secondary">Free Tier</Badge>
                        <p className="text-lg font-semibold">Upgrade to Pro to unlock unlimited tests and smart analytics.</p>
                    </div>
                 )}
             </CardContent>
             <CardFooter>
                 {isPro ? (
                    <Button variant="secondary" className="w-full" onClick={handleCancelSubscription}>Manage Subscription</Button>
                 ) : (
                    <Button variant="secondary" asChild className="w-full">
                        <Link href="/dashboard/subscription">Upgrade Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                 )}
             </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}
