import { cn } from "@/lib/utils";

type Tone = "calories" | "protein" | "carbs" | "fats" | "fibre";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  label: string;
  unit?: string;
  tone?: Tone;
  className?: string;
  showPercentage?: boolean;
}

const toneVar: Record<Tone, string> = {
  calories: "--macro-calories",
  protein: "--macro-protein",
  carbs: "--macro-carbs",
  fats: "--macro-fats",
  fibre: "--macro-fibre",
};

const dims = { sm: 72, md: 112, lg: 148 } as const;
const strokes = { sm: 7, md: 9, lg: 11 } as const;
const valueText = { sm: "text-lg", md: "text-3xl", lg: "text-4xl" } as const;

/**
 * Ring showing progress towards a daily target. Colour comes from the
 * nutrition palette so each macro is recognisable at a glance.
 */
export const CircularProgress = ({
  value,
  max,
  size = "md",
  label,
  unit,
  tone = "calories",
  className,
  showPercentage = false,
}: CircularProgressProps) => {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(value / safeMax, 1);
  const dim = dims[size];
  const stroke = strokes[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const over = value > safeMax;
  const colour = `hsl(var(${toneVar[tone]}))`;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      role="img"
      aria-label={`${label}: ${value} of ${max}${unit ? " " + unit : ""}`}
    >
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke="hsl(var(--muted))"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke={colour}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className={cn("font-display font-semibold tabular-nums text-foreground", valueText[size])}>
            {showPercentage ? `${Math.round(ratio * 100)}%` : value}
          </span>
          {!showPercentage && size !== "sm" && (
            <span className="mt-1 text-xs text-muted-foreground tabular-nums">
              of {max}
              {unit ? ` ${unit}` : ""}
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {over && <p className="text-xs text-muted-foreground">over target</p>}
      </div>
    </div>
  );
};
