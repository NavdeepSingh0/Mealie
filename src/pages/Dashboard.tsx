import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Plus, Trophy, TrendingUp, X, Target } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isReturningUser ? "Set Your Daily Nutrition Goals 🎯" : "Welcome to Mealie! 🍽️"}
            </CardTitle>
            <CardDescription>
              {isReturningUser 
                ? "Complete your profile by setting your daily nutrition targets" 
                : "Your smart nutrition companion - set your daily goals to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setShowGoalsDialog(true)}
            >
              {isReturningUser ? "Set Daily Goals" : "Set Today's Nutrition Goals"}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Mealie Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your nutrition journey with your smart companion</p>
          </div>
          <Button variant="outline" onClick={() => setShowGoalsDialog(true)}>
            Edit Goals
          </Button>
        </div>

        {/* Today's Progress */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card">
            <CardContent className="pt-6 flex justify-center">
              <CircularProgress 
                value={Math.round(nutritionTotals.calories)}
                max={goals?.daily_calorie_goal || 2000}
                label="Calories"
                size="md"
              />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6 flex justify-center">
              <CircularProgress 
                value={Math.round(nutritionTotals.protein)}
                max={goals?.daily_protein_goal || 50}
                label="Protein (g)"
                size="md"
              />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6 flex justify-center">
              <CircularProgress 
                value={Math.round(nutritionTotals.carbs)}
                max={300}
                label="Carbs (g)"
                size="md"
              />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6 flex justify-center">
              <CircularProgress 
                value={Math.round(nutritionTotals.fats)}
                max={70}
                label="Fats (g)"
                size="md"
              />
            </CardContent>
          </Card>
        </div>

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>Track what you've eaten today</CardDescription>
              </div>
              <Button onClick={() => navigate("/discover")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaysMeals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-2">No meals logged yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">Start tracking your nutrition by adding your first meal</p>
                <Button onClick={() => navigate("/discover")} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Meal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysMeals.map((meal) => (
                  <div 
                    key={meal.id} 
                    className="flex justify-between items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{meal.nutrition_info?.["Dish Name"]}</div>
                      <div className="text-sm text-muted-foreground">
                        {meal.meal_type} • {meal.serving_size}x serving
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(meal.nutrition_info?.["Calories (kcal)"] * meal.serving_size)} kcal
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate("/analytics")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Achievements
              </CardTitle>
              <CardDescription>View your nutrition achievements</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate("/analytics")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Trends
              </CardTitle>
              <CardDescription>Track your weekly progress</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

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