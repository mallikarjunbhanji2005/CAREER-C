import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Lightweight markdown renderer — handles headings, bold, bullets, no deps needed
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-2 text-sm text-foreground", className)}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // ## Heading
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="font-semibold text-base text-foreground mt-4 first:mt-0">
              {line.slice(3)}
            </h3>
          );
        }
        // ### Sub-heading
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="font-medium text-foreground mt-3">
              {line.slice(4)}
            </h4>
          );
        }
        // - bullet
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        // numbered list
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-2 text-muted-foreground">
                <span className="shrink-0 font-mono text-xs text-muted-foreground/60 mt-0.5 w-4">{match[1]}.</span>
                <span>{renderInline(match[2])}</span>
              </div>
            );
          }
        }

        return <p key={i} className="text-muted-foreground leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
