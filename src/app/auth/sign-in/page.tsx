import { SignInForm } from "@/components/auth/SignInForm";
import { TrendingUp } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex bg-grid">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-12 py-10 border-r border-border relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <TrendingUp className="size-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">Ascend</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold leading-tight text-gradient">
            Your career,<br />on your terms.
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            AI-powered roadmaps, milestone tracking, and real interview prep — all in one place.
          </p>
        </div>

        <p className="text-xs text-muted-foreground relative z-10">© 2025 Ascend</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <TrendingUp className="size-5 text-primary" />
          <span className="font-bold text-sm">Ascend</span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue your ascent</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
