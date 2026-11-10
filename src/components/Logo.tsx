import { cn } from "@/lib/utils";

/** A plate split into the three macros: protein, carbs, fats. */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
    <circle cx="16" cy="16" r="14.2" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
    <g stroke="hsl(var(--card))" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M16 16 L16 6 A10 10 0 0 1 24.66 21 Z" fill="hsl(var(--macro-protein))" />
      <path d="M16 16 L24.66 21 A10 10 0 0 1 7.34 21 Z" fill="hsl(var(--macro-carbs))" />
      <path d="M16 16 L7.34 21 A10 10 0 0 1 16 6 Z" fill="hsl(var(--primary))" />
    </g>
  </svg>
);

export const Logo = ({ className, markClassName }: { className?: string; markClassName?: string }) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <LogoMark className={markClassName} />
    <span className="font-display text-2xl font-semibold tracking-tight">Mealie</span>
  </span>
);
