import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainHeader } from "@/components/main-header";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Lightbulb, BarChart, TestTube, BrainCircuit } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: "AI-Powered Questions",
    description: "Leverage cutting-edge AI to generate relevant and challenging test questions tailored to your study needs.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Detailed Analytics",
    description: "Track your progress with in-depth performance analysis, identifying your strengths and areas for improvement.",
  },
  {
    icon: <TestTube className="h-8 w-8 text-primary" />,
    title: "Comprehensive Test Series",
    description: "Access a wide range of test series for various exams, curated by experts to simulate the real exam experience.",
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: "Insightful Explanations",
    description: "Understand the 'why' behind every answer with clear, concise explanations for each question.",
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image-1');

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-grow">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">
                Master Your Exams with <span className="text-primary">Verse Exam Prep</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                The ultimate AI-powered platform to ace your tests. Personalized question generation, detailed progress tracking, and realistic exam simulations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard/tests">Explore Tests</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="rounded-xl shadow-2xl object-cover w-full h-full"
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose Verse Exam Prep?</h2>
              <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
                We provide a comprehensive and intelligent learning ecosystem to ensure your success.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="items-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Verse Exam Prep. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
