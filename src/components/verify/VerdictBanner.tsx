import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VerificationVerdict } from "@/types";

interface VerdictBannerProps {
  verdict: VerificationVerdict;
  onRetry: () => void;
}

export function VerdictBanner({ verdict, onRetry }: VerdictBannerProps) {
  const isPass = verdict.verdict === "pass";

  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${
        isPass
          ? "border-green-500/40 bg-green-500/10"
          : "border-red-500/40 bg-red-500/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-lg font-semibold ${
            isPass ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPass ? "✓ Passed" : "✗ Not quite there yet"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{verdict.summary}</p>
      <div>
        {isPass ? (
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to Dashboard
          </Link>
        ) : (
          <button className={cn(buttonVariants({ variant: "outline", size: "sm" }))} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
