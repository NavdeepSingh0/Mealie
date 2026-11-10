import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Logo } from "@/components/Logo";
import { MealThumb } from "@/components/MealThumb";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------ */
/* Sample data. Everything on this page is illustrative, not a user's. */
/* ------------------------------------------------------------------ */

const SAMPLE_MEALS = [
  { name: "Moong dal chilla", slot: "Breakfast", kcal: 210, protein: 12 },
  { name: "Rajma chawal", slot: "Lunch", kcal: 420, protein: 15 },
  { name: "Paneer bhurji with roti", slot: "Dinner", kcal: 380, protein: 22 },
];

const SAMPLE_DISHES = [
  { name: "Tandoori chicken", kcal: 150, protein: 22 },
  { name: "Palak paneer", kcal: 240, protein: 14 },
  { name: "Sambar", kcal: 90, protein: 5 },
];

const STEPS = [
  {
    title: "Set your targets",
    body: "Pick a daily calorie and protein goal. You can change it whenever your routine changes.",
  },
  {
    title: "Log what you ate",
    body: "Search the dish, choose a serving size and meal slot. The macros are filled in for you.",
  },
  {
    title: "Adjust as you go",
    body: "Watch the rings fill through the day, plan the week ahead, and ask the assistant for swaps.",
  },
];

/* ------------------------------------------------------------------ */

const SampleDay = () => (
  <div className="relative mx-auto w-full max-w-md">
    {/* a second sheet behind, for depth */}
    <div className="absolute inset-x-6 -bottom-3 top-6 rotate-[2.5deg] rounded-3xl border bg-muted/70" aria-hidden="true" />
    <div className="paper relative rotate-[-1.2deg] p-6 shadow-[var(--shadow-lg)] md:p-7">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">A sample day</p>
        <p className="text-xs text-muted-foreground">illustrative</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
        <CircularProgress value={1010} max={2000} size="sm" label="Calories" tone="calories" />
        <CircularProgress value={49} max={80} size="sm" label="Protein (g)" tone="protein" />
      </div>

      <ul className="mt-6 divide-y divide-border/70 border-t border-border/70">
        {SAMPLE_MEALS.map((m) => (
          <li key={m.name} className="flex items-center gap-3 py-3">
            <MealThumb name={m.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.slot}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">{m.kcal} kcal</p>
              <p className="text-xs text-muted-foreground tabular-nums">{m.protein}g protein</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Tile = ({
  title,
  body,
  className = "",
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={`paper flex flex-col gap-5 p-6 md:p-7 ${className}`}>
    <div>
      <h3 className="text-xl md:text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{body}</p>
    </div>
    <div className="mt-auto">{children}</div>
  </div>
);

const Landing = () => {
  const { user, loading } = useAuth(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" aria-label="Mealie home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <a href="#features" className="hidden px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground md:inline">
              Features
            </a>
            <a href="#how" className="hidden px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground md:inline">
              How it works
            </a>
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grain pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-rise">
            <p className="eyebrow">Nutrition tracking for Indian food</p>
            <h1 className="mt-5 text-5xl leading-[1.02] md:text-7xl">
              Know what&rsquo;s on your{" "}
              <span className="relative whitespace-nowrap text-primary">
                thali
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-secondary"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 8 C 30 2, 60 11, 118 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Log dal, roti, paneer and biryani, see your protein and calories add up through the day, then plan the
              week and build the grocery list from it.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" variant="hero">
                <Link to="/auth">
                  Start tracking
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Sign in with Google or email.</p>
          </div>

          <div className="animate-rise [animation-delay:150ms]">
            <SampleDay />
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="border-y border-border/70 bg-card">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8 md:py-24">
          <p className="font-display text-3xl leading-snug md:text-5xl md:leading-[1.15]">
            Generic calorie counters leave you guessing what a katori of dal is worth. Mealie&rsquo;s dish database
            starts from Indian food.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow">What&rsquo;s inside</p>
          <h2 className="mt-4 text-4xl md:text-5xl">Everything for the week, in one place</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-6">
          <Tile
            className="md:col-span-4"
            title="Search dishes the way you cook"
            body="Filter by calories or protein, see carbs, fats, fibre and sodium per serving, and add a dish to today in two taps."
          >
            <div className="rounded-2xl border bg-background p-3">
              <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Search dishes
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium">Under 200 kcal</span>
                <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium">20g+ protein</span>
              </div>
              <ul className="mt-3 divide-y divide-border/70">
                {SAMPLE_DISHES.map((d) => (
                  <li key={d.name} className="flex items-center gap-3 py-2.5">
                    <MealThumb name={d.name} size="sm" />
                    <span className="flex-1 text-sm font-semibold">{d.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {d.kcal} kcal &middot; {d.protein}g protein
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Ask for a swap"
            body="Ask the assistant for a similar dish or a lighter version of something you love."
          >
            <div className="space-y-2.5 text-sm">
              <div className="ml-auto w-fit max-w-[92%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                Lighter version of butter chicken?
              </div>
              <div className="flex w-fit max-w-[92%] items-start gap-2 rounded-2xl rounded-bl-md border bg-background px-4 py-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>
                  Try tandoori chicken with mint raita. You keep the protein and skip the cream gravy.
                </span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">Illustrative conversation</p>
            </div>
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Plan the week"
            body="Fill breakfast, lunch, dinner and snacks for each day, or let the assistant draft a plan."
          >
            <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="space-y-1.5 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground">{d}</p>
                  {[0, 1, 2, 3].map((r) => (
                    <div
                      key={r}
                      className={`h-3.5 rounded-md ${(i + r) % 5 === 0 ? "bg-muted" : r === 0 ? "bg-secondary/80" : r === 1 ? "bg-primary/75" : r === 2 ? "bg-tertiary/75" : "bg-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Groceries from the plan"
            body="Ingredients from your planned dishes roll up into one checklist, grouped by category."
          >
            <ul className="space-y-2 text-sm" aria-hidden="true">
              {[
                ["Moong dal", true],
                ["Paneer", true],
                ["Spinach", false],
              ].map(([item, done]) => (
                <li key={item as string} className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${done ? "border-tertiary bg-tertiary text-tertiary-foreground" : "bg-card"}`}
                  >
                    {done && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className={done ? "text-muted-foreground line-through" : "font-medium"}>{item as string}</span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile
            className="md:col-span-2"
            title="See the trend"
            body="A seven-day view of calories, protein and carbs, plus streaks for hitting your targets."
          >
            <svg viewBox="0 0 200 64" className="h-16 w-full" aria-hidden="true">
              <path d="M0 48 C 25 40, 40 20, 65 28 S 110 52, 135 30 S 175 8, 200 18" fill="none" stroke="hsl(var(--macro-calories))" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0 56 C 30 50, 50 44, 80 46 S 120 40, 150 42 S 185 34, 200 36" fill="none" stroke="hsl(var(--macro-protein))" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0 40 C 30 44, 55 36, 85 38 S 125 24, 155 26 S 185 30, 200 24" fill="none" stroke="hsl(var(--macro-carbs))" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </Tile>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-border/70 bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Three steps, then it&rsquo;s a habit</h2>
          </div>
          <ol className="divide-y divide-border">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-6 py-8 first:pt-0 last:pb-0 md:gap-10">
                <span className="w-10 shrink-0 font-display text-5xl leading-none text-primary md:w-14 md:text-6xl">{i + 1}</span>
                <div>
                  <h3 className="text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-24">
          <h2 className="max-w-xl text-4xl leading-tight text-background md:text-5xl">
            Start with today&rsquo;s lunch.
          </h2>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">
              Create your account
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:px-8">
          <p>&copy; {new Date().getFullYear()} Mealie. Built by Navdeep Singh Dhunna.</p>
          <a
            href="https://github.com/NavdeepSingh0/Mealie"
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
