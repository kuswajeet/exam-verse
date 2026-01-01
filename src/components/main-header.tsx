import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/icons";

export function MainHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b">
      <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
        <AppLogo className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold font-headline">Verse Exam Prep</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Button asChild variant="ghost">
          <Link href="/login" prefetch={false}>
            Login
          </Link>
        </Button>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/signup" prefetch={false}>
            Sign Up
          </Link>
        </Button>
      </nav>
    </header>
  );
}
