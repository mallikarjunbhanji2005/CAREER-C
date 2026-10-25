"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function OnboardingForm() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentRole.trim() || !targetRole.trim()) {
      setError("Current role and target role are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole: currentRole.trim(),
          targetRole: targetRole.trim(),
          company: company.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data as { error?: string; detail?: string };
        setError(msg.detail ?? msg.error ?? "Failed to generate roadmap. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/home");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  const inputClass = "input-base";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="currentRole" className="text-sm font-medium text-foreground">
          Current Role
        </label>
        <input
          id="currentRole"
          type="text"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className={inputClass}
          placeholder="e.g. Junior Frontend Developer"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="targetRole" className="text-sm font-medium text-foreground">
          Target Role
        </label>
        <input
          id="targetRole"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className={inputClass}
          placeholder="e.g. Staff Engineer"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="company" className="text-sm font-medium text-foreground">
          Company / Industry{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputClass}
          placeholder="e.g. Google, fintech startup, healthcare"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full glow-primary">
        {loading ? "Building your roadmap…" : "Generate Roadmap"}
      </Button>
    </form>
  );
}
