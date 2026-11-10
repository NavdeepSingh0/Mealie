import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MealThumb } from "@/components/MealThumb";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Target, TrendingUp, X, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SetGoalsDialog } from "@/components/dashboard/SetGoalsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { FeatureTour } from "@/components/onboarding/FeatureTour";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasGoals, setHasGoals] = useState(false);
  const [goals, setGoals] = useState<any>(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [todaysMeals, setTodaysMeals] = useState<any[]>([]);
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const { needsOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding(user);

  const handleOnboardingComplete = async (data: any) => {
    const { error } = await completeOnboarding(data);
    
    if (error) {
      toast.error("Failed to save your goals. Please try again.");
      return;
    }
    
    toast.success("Goals saved! Let's take a quick tour.");
    setShowFeatureTour(true);
  };

  const handleTourComplete = () => {
    setShowFeatureTour(false);
    checkAndLoadGoals();
    loadTodaysMeals();
  };

  useEffect(() => {
    if (!user) return;
    checkAndLoadGoals();
    loadTodaysMeals();
  }, [user]);

  const checkAndLoadGoals = async () => {
    if (!user) return;
    
    setGoalsLoading(true);
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setHasGoals(true);
        setGoals(data);
      } else {
        setHasGoals(false);
        setGoals(null);
      }
    } finally {
      setGoalsLoading(false);
    }
  };

  const loadTodaysMeals = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    // 1) Fetch meals for today (no implicit join)
    const { data: meals, error } = await supabase
      .from("user_meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("consumed_at", today);

    if (error) return;

    // 2) Fetch nutrition info for referenced dishes and merge locally
    const dishIds = (meals || []).map((m: any) => m.dish_id).filter(Boolean);
    let nutritionMap: Record<string, any> = {};
    if (dishIds.length) {
      const { data: dishes } = await supabase
        .from("nutrition_info")
        .select("*")
        .in("id", dishIds);
      (dishes || []).forEach((d: any) => {
        nutritionMap[d.id] = d;
      });
    }

    const enriched = (meals || []).map((m: any) => ({
      ...m,
      nutrition_info: nutritionMap[m.dish_id] || null,
    }));

    setTodaysMeals(enriched);
    calculateNutritionTotals(enriched);
  };

  const calculateNutritionTotals = (meals: any[]) => {
    const totals = meals.reduce((acc, meal) => {
      const servings = meal.serving_size || 1;
      const dish = meal.nutrition_info;
      
      return {
        calories: acc.calories + ((dish?.["Calories (kcal)"] || 0) * servings),
        protein: acc.protein + ((dish?.["Protein (g)"] || 0) * servings),
        carbs: acc.carbs + ((dish?.["Carbohydrates (g)"] || 0) * servings),
        fats: acc.fats + ((dish?.["Fats (g)"] || 0) * servings),
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setNutritionTotals(totals);
  };

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from("user_meals")
      .delete()
      .eq("id", mealId);

    if (error) {
      toast.error("Failed to delete meal");
    } else {
      toast.success("Meal removed");
      loadTodaysMeals();
    }
  };

  const handleGoalsSaved = () => {
    setShowGoalsDialog(false);
    checkAndLoadGoals();
  };

  if (loading || onboardingLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="space-y-4 text-center" role="status">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading your day...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingModal 
        open={needsOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show feature tour after onboarding completes
  if (showFeatureTour) {
    return (
      <FeatureTour 
        open={showFeatureTour}
        onComplete={handleTourComplete}
      />
    );
  }

  if (!goalsLoading && !hasGoals) {
    const isReturningUser = !needsOnboarding && !onboardingLoading;

    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/25 text-secondary-foreground">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <CardTitle className="text-3xl">
              {isReturningUser ? "Set your daily targets" : "Welcome to Mealie"}
            </CardTitle>
            <CardDescription className="text-base">
              {isReturningUser
                ? "Choose the calorie and protein goals the rings will track."
                : "Set your daily goals to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" variant="hero" onClick={() => setShowGoalsDialog(true)}>
              {isReturningUser ? "Set daily goals" : "Set today's goals"}
            </Button>
          </CardContent>
        </Card>
        <SetGoalsDialog 
          open={showGoalsDialog} 
          onOpenChange={setShowGoalsDialog}
          onSaved={handleGoalsSaved}
        />
      </div>
    );
  }

  const calorieGoal = goals?.daily_calorie_goal || 2000;
  const caloriesLeft = Math.round(calorieGoal - nutritionTotals.calories);
  const macros = [
    { label: "Protein", value: Math.round(nutritionTotals.protein), max: goals?.daily_protein_goal || 50, bar: "bg-macro-protein" },
    { label: "Carbs", value: Math.round(nutritionTotals.carbs), max: 300, bar: "bg-macro-carbs" },
    { label: "Fats", value: Math.round(nutritionTotals.fats), max: 70, bar: "bg-macro-fats" },
  ];

  const slotOrder = ["breakfast", "lunch", "dinner", "snack"];
  const slots = [
    ...slotOrder,
    ...Array.from(new Set(todaysMeals.map((m) => m.meal_type).filter((t) => t && !slotOrder.includes(t)))),
  ]
    .map((slot) => ({ slot, meals: todaysMeals.filter((m) => m.meal_type === slot) }))
    .filter((g) => g.meals.length > 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="page space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1 className="page-title mt-3">{greeting}.</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowGoalsDialog(true)}>
            <Target className="h-4 w-4" />
            Edit goals
          </Button>
          <Button variant="hero" onClick={() => navigate("/discover")}>
            <Plus className="h-4 w-4" />
            Add meal
          </Button>
        </div>
      </div>

      {/* Today's progress */}
      <section aria-labelledby="progress-heading" className="paper grid gap-8 p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-14 md:p-9">
        <h2 id="progress-heading" className="sr-only">Today's progress</h2>
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={Math.round(nutritionTotals.calories)}
            max={calorieGoal}
            label="Calories"
            unit="kcal"
            tone="calories"
            size="lg"
          />
          <p className="text-sm text-muted-foreground tabular-nums">
            {caloriesLeft >= 0 ? `${caloriesLeft} kcal left today` : `${Math.abs(caloriesLeft)} kcal over target`}
          </p>
        </div>

        <ul className="space-y-6">
          {macros.map((m) => {
            const pct = Math.min((m.value / m.max) * 100, 100);
            return (
              <li key={m.label}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    <span className="font-display text-xl font-semibold text-foreground">{m.value}</span> / {m.max} g
                  </span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={m.label}
                  aria-valuenow={m.value}
                  aria-valuemin={0}
                  aria-valuemax={m.max}
                >
                  <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", m.bar)} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Today's meals */}
      <section aria-labelledby="meals-heading">
        <h2 id="meals-heading" className="mb-4 text-2xl">Today&rsquo;s meals</h2>

        {todaysMeals.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-card/60 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/25 text-secondary-foreground">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <p className="font-display text-2xl">Nothing logged yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Add what you had for breakfast and the rings above will start to fill.
            </p>
            <Button className="mt-6" variant="hero" onClick={() => navigate("/discover")}>
              <Plus className="h-4 w-4" />
              Add your first meal
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {slots.map(({ slot, meals }) => (
              <div key={slot}>
                <p className="eyebrow mb-2 capitalize">{slot}</p>
                <ul className="paper divide-y divide-border/70 overflow-hidden">
                  {meals.map((meal) => {
                    const name = meal.nutrition_info?.["Dish Name"] ?? "Unknown dish";
                    const kcal = Math.round((meal.nutrition_info?.["Calories (kcal)"] || 0) * (meal.serving_size || 1));
                    return (
                      <li key={meal.id} className="flex items-center gap-4 p-4">
                        <MealThumb name={name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.serving_size}&times; serving
                          </p>
                        </div>
                        <p className="font-semibold tabular-nums">{kcal} kcal</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteMeal(meal.id)}
                          aria-label={`Remove ${name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Link on to trends */}
      <button
        onClick={() => navigate("/analytics")}
        className="paper paper-hover group flex w-full items-center justify-between p-5 text-left md:p-6"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary">
            <TrendingUp className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold">How is your week going?</span>
            <span className="block text-sm text-muted-foreground">See your trends and streaks</span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </button>

      <SetGoalsDialog 
        open={showGoalsDialog} 
        onOpenChange={setShowGoalsDialog}
        onSaved={handleGoalsSaved}
        existingGoals={goals}
      />
    </div>
  );
};

export default Dashboard;
