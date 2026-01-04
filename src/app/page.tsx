'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart, BookCopy, Zap } from "lucide-react";
import Image from "next/image";
import { MainHeader } from "@/components/main-header";
import { useFirebase } from "@/firebase/provider"; // Import Firebase Hook

export default function LandingPage() {
  // Check if user is logged in
  const { user } = useFirebase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Master Your Exams with Exam Verse
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our AI-powered platform provides you with personalized mock tests, real-time analytics, and expert content.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {user ? (
                     /* If Logged In: Show Dashboard Button */
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href="/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                  ) : (
                     /* If Logged Out: Show Signup Button */
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/signup">
                        Start Practicing for Free
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
               <Image
                  src="https://picsum.photos/seed/2/600/400"
                  width="600"
                  height="400"
                  alt="A student studying with focus"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From realistic mock tests to in-depth performance analysis, our platform is designed to give you the edge.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader className="items-center">
                   <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground"><BookCopy className="h-8 w-8" /></div>
                  <CardTitle>Real Exam Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Experience the pressure and pattern of the actual exam with our timed and structured mock tests.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground"><BarChart className="h-8 w-8" /></div>
                  <CardTitle>Smart Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Our AI analyzes your performance to pinpoint your weak areas, helping you study smarter, not harder.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground"><Zap className="h-8 w-8" /></div>
                  <CardTitle>Study Material</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Access a rich library of expert-curated notes and one-liner flashcards for quick revision sessions.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose the plan that's right for you. Get started for free and upgrade anytime.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Free</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <p className="text-4xl font-bold">$0</p>
                          <ul className="space-y-2 text-left">
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> Basic Analytics</li>
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> Limited Mock Tests</li>
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> Access to Notes</li>
                          </ul>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/signup">Sign Up</Link>
                          </Button>
                      </CardContent>
                  </Card>
                   <Card className="border-primary shadow-lg">
                      <CardHeader>
                          <CardTitle>Pro</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <p className="text-4xl font-bold">$10<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                          <ul className="space-y-2 text-left">
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> Full Analytics</li>
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> Unlimited Tests</li>
                              <li className="flex items-center gap-2"><Check className="text-green-500" /> AI Question Generator</li>
                          </ul>
                          <Button className="w-full" asChild>
                             <Link href="/signup">Go Pro</Link>
                          </Button>
                      </CardContent>
                  </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Exam Verse. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}