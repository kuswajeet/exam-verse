'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isPro, setIsPro] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Check initial pro status from localStorage
  useEffect(() => {
    const proStatus = localStorage.getItem('isPro') === 'true';
    setIsPro(proStatus);
  }, []);

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    setProcessingPlan(plan);
    setTimeout(() => {
      localStorage.setItem('isPro', 'true');
      setIsPro(true);
      toast({
        title: 'Upgrade Successful!',
        description: 'Welcome to the Pro Plan. All features are now unlocked.',
        className: 'bg-green-100 dark:bg-green-900',
      });
      alert('Payment Successful! You are now a Pro Member.');
      setProcessingPlan(null);
    }, 2000);
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For getting started',
      features: ['Basic Access', '1 Mock Test/Day', 'Limited Analytics', 'Access to Free Notes'],
      isCurrent: !isPro,
      buttonText: 'Current Plan',
      buttonAction: null,
    },
    {
      name: 'Pro Monthly',
      price: '$9',
      pricePeriod: '/ month',
      description: 'For serious learners',
      features: ['Unlimited Tests', 'Full Smart Analytics', 'AI Question Generator', 'All Study Materials'],
      isCurrent: false,
      isPrimary: !isPro,
      planId: 'monthly',
      buttonText: 'Upgrade Now',
      buttonAction: () => handleUpgrade('monthly'),
    },
    {
      name: 'Pro Yearly',
      price: '$99',
      pricePeriod: '/ year',
      description: 'Best value for long-term prep',
      features: ['Everything in Pro Monthly', 'Best Value (Save $9)', 'Priority Support'],
      isCurrent: false,
      isPrimary: false,
      planId: 'yearly',
      buttonText: 'Upgrade Now',
      buttonAction: () => handleUpgrade('yearly'),
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Choose Your Plan</CardTitle>
          <CardDescription>
            {isPro
              ? "You're currently on the Pro Plan. Thank you for your support!"
              : 'Upgrade to unlock all features and accelerate your learning.'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn('flex flex-col', plan.isPrimary && 'border-primary border-2 shadow-lg')}
          >
            <CardHeader>
              {plan.isPrimary && (
                <div className="flex justify-center">
                  <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}
              <CardTitle className="text-center text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-center">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.pricePeriod && (
                  <span className="text-muted-foreground">{plan.pricePeriod}</span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={plan.isCurrent || !!processingPlan}
                onClick={plan.buttonAction || undefined}
                variant={plan.isPrimary ? 'default' : 'outline'}
              >
                {processingPlan === plan.planId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
