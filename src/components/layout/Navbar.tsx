"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  email?: string;
}

const tabs = [
  { label: "Roadmap", href: "/dashboard/roadmap" },
  { label: "Progress", href: "/dashboard/progress" },
];

const toolLinks = [
  { label: "Resume Gap", href: "/tools/resume" },
  { label: "JD Matcher", href: "/tools/jd-match" },
  { label: "Interview Prep", href: "/tools/interview-prep" },
];

export function Navbar({ email }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  const showDashTabs = pathname.startsWith("/dashboard");
  const isToolActive = pathname.startsWith("/tools");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 font-bold text-foreground shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
            <TrendingUp className="size-3.5 text-primary" />
          </div>
          Ascend
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {showDashTabs && tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === tab.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isToolActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Tools
              <ChevronDown className={cn("size-3.5 transition-transform", toolsOpen && "rotate-180")} />
            </button>
            {toolsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-background shadow-lg py-1 z-50">
                {toolLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setToolsOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-sm transition-colors",
                      pathname === link.href
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User + sign out */}
        <div className="flex items-center gap-3 shrink-0">
          {email && (
            <span className="hidden text-xs text-muted-foreground sm:block truncate max-w-[160px]">
              {email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
