import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MealThumb } from "@/components/MealThumb";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddMealToPlanDialog } from "@/components/mealplan/AddMealToPlanDialog";
import { useAuth } from "@/hooks/useAuth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const MealPlan = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mealPlan, setMealPlan] = useState<any>({});
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (user) loadMealPlan();
  }, [user]);

  const loadMealPlan = async () => {
    if (!user) return;
    
    // Load from grocery_lists table as meal plans
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && data.items) {
      setMealPlan(data.items);
    }
  };

  const handleAddMeal = (day: string, mealType: string) => {
    setSelectedSlot({ day, mealType });
    setShowAddDialog(true);
  };

  const handleRemoveMeal = async (day: string, mealType: string, mealIndex: number) => {
    const updatedPlan = { ...mealPlan };
    if (updatedPlan[day] && updatedPlan[day][mealType]) {
      updatedPlan[day][mealType].splice(mealIndex, 1);
      if (updatedPlan[day][mealType].length === 0) {
        delete updatedPlan[day][mealType];
      }
    }

    await saveMealPlan(updatedPlan);
  };

  const saveMealPlan = async (plan: any) => {
    if (!user) return;
    
    // Check if there's an existing meal plan
    const { data: existing } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("grocery_lists")
        .update({ items: plan })
        .eq("id", existing.id);

      if (error) {
        toast.error("Failed to save meal plan");
      } else {
        setMealPlan(plan);
        toast.success("Meal plan updated");
      }
    } else {
      const { error } = await supabase
        .from("grocery_lists")
        .insert([{
          user_id: user.id,
          list_name: "Weekly Meal Plan",
          items: plan,
          completed: false,
        }]);

      if (error) {
        toast.error("Failed to create meal plan");
      } else {
        setMealPlan(plan);
        toast.success("Meal plan created");
      }
    }
  };

  const handleMealAdded = (dishData: any) => {
    const updatedPlan = { ...mealPlan };
    if (!updatedPlan[selectedSlot.day]) {
      updatedPlan[selectedSlot.day] = {};
    }
    if (!updatedPlan[selectedSlot.day][selectedSlot.mealType]) {
      updatedPlan[selectedSlot.day][selectedSlot.mealType] = [];
    }
    updatedPlan[selectedSlot.day][selectedSlot.mealType].push(dishData);
    
    saveMealPlan(updatedPlan);
    setShowAddDialog(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const todayName = DAYS[(new Date().getDay() + 6) % 7];
  const dayTotal = (day: string): number =>
    (Object.values(mealPlan[day] || {}) as any[][]).reduce(
      (sum, meals) => sum + meals.reduce((a, m) => a + (Number(m.calories) || 0), 0),
      0
    );
  const slotDot: Record<string, string> = {
    breakfast: "bg-secondary",
    lunch: "bg-primary",
    dinner: "bg-tertiary",
    snack: "bg-muted-foreground/60",
  };

  return (
    <div className="page space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">This week</p>
          <h1 className="page-title mt-3">Meal plan</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Fill each day, or let the assistant draft a week for you.
          </p>
        </div>
        <Button onClick={() => navigate("/ai-chat?action=mealplan")} variant="hero">
          <Sparkles className="h-4 w-4" />
          Generate a plan
        </Button>
      </div>

      {/* Weekly plan */}
      <div className="space-y-5">
        {DAYS.map((day) => {
          const total = dayTotal(day);
          const isToday = day === todayName;
          return (
            <section
              key={day}
              aria-labelledby={`day-${day}`}
              className={cn("paper p-5 md:p-6", isToday && "border-primary/50 ring-1 ring-primary/30")}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 id={`day-${day}`} className="text-2xl">{day}</h2>
                  {isToday && (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Today
                    </span>
                  )}
                </div>
                {total > 0 && (
                  <p className="text-sm text-muted-foreground tabular-nums">{Math.round(total)} kcal planned</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MEAL_TYPES.map((mealType) => {
                  const meals = mealPlan[day]?.[mealType] || [];
                  return (
                    <div key={mealType} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", slotDot[mealType])} aria-hidden="true" />
                        <h3 className="font-sans text-sm font-semibold capitalize tracking-normal">{mealType}</h3>
                      </div>

                      {meals.map((meal: any, index: number) => (
                        <div
                          key={index}
                          className="group flex items-center gap-3 rounded-xl border bg-background p-2.5 pr-1.5"
                        >
                          <MealThumb name={meal.dishName} size="sm" className="h-9 w-9 rounded-lg" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{meal.dishName}</p>
                            <p className="text-xs text-muted-foreground tabular-nums">{meal.calories} kcal</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-100 hover:text-destructive md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
                            onClick={() => handleRemoveMeal(day, mealType, index)}
                            aria-label={`Remove ${meal.dishName}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddMeal(day, mealType)}
                        className={cn(
                          "flex w-full items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                          meals.length === 0 ? "border-2 border-dashed py-2.5 hover:border-primary/50" : "py-1.5 text-xs hover:bg-accent"
                        )}
                      >
                        <Plus className="h-4 w-4" />
                        {meals.length === 0 ? "Add" : "Add another"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <AddMealToPlanDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onMealAdded={handleMealAdded}
        slot={selectedSlot}
      />
    </div>
  );
};

export default MealPlan;
