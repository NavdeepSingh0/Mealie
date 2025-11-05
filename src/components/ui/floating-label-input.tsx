import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background px-3 pt-4 pb-1 text-sm transition-all",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <label
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all pointer-events-none",
            (isFocused || hasValue || props.value) && "top-2 text-xs translate-y-0"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };