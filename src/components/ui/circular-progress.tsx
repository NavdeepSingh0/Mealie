import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  label: string;
  className?: string;
  showPercentage?: boolean;
}

export const CircularProgress = ({
  value,
  max,
  size = "md",
  label,
  className,
  showPercentage = false,
}: CircularProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const valueSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50%"
            cy="50%"
            r="40"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-foreground", valueSizes[size])}>
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </span>
          {!showPercentage && (
            <span className={cn("text-muted-foreground", textSizes[size])}>
              / {max}
            </span>
          )}
        </div>
      </div>
      <span className={cn("text-muted-foreground font-medium text-center", textSizes[size])}>
        {label}
      </span>
    </div>
  );
};