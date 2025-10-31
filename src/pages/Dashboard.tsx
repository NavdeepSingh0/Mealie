import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Trophy, TrendingUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SetGoalsDialog } from "@/components/dashboard/SetGoalsDialog";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasGoals, setHasGoals] = useState(false);
  const [goals, setGoals] = useState<any>(null);
  const [todaysMeals, setTodaysMeals] = useState<any[]>([]);
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkAndLoadGoals();
    loadTodaysMeals();
  }, [user]);

  const checkAndLoadGoals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!hasGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Mealie!</CardTitle>
            <CardDescription>Your smart nutrition companion - set your daily goals to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setShowGoalsDialog(true)}
            >
              Set Today's Nutrition Goals
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
            <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your nutrition journey</p>
          </div>
          <Button variant="outline" onClick={() => setShowGoalsDialog(true)}>
            Edit Goals
          </Button>
        </div>

        {/* Today's Progress */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(nutritionTotals.calories)}</div>
              <p className="text-xs text-muted-foreground">of {goals?.daily_calorie_goal || 2000} kcal</p>
              <Progress 
                value={(nutritionTotals.calories / (goals?.daily_calorie_goal || 2000)) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Protein</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(nutritionTotals.protein)}g</div>
              <p className="text-xs text-muted-foreground">of {goals?.daily_protein_goal || 50}g</p>
              <Progress 
                value={(nutritionTotals.protein / (goals?.daily_protein_goal || 50)) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Carbohydrates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(nutritionTotals.carbs)}g</div>
              <p className="text-xs text-muted-foreground">Daily intake</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(nutritionTotals.fats)}g</div>
              <p className="text-xs text-muted-foreground">Daily intake</p>
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
              <div className="text-center py-8 text-muted-foreground">
                No meals logged yet. Start by adding your first meal!
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
