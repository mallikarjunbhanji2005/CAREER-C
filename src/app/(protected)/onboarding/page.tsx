import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { TrendingUp } from "lucide-react";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-grid relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <TrendingUp className="size-5 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Build your roadmap</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Tell us where you are and where you want to go — we&apos;ll build a personalised AI career plan.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
