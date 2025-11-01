import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Meal Plan</h1>
            <p className="text-muted-foreground mt-2">Plan your weekly meals</p>
          </div>
          <Button onClick={() => navigate("/ai-chat?action=mealplan")} size="sm" className="w-full md:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="md:inline">Generate Plan</span>
          </Button>
        </div>

        {/* Weekly Meal Plan Grid */}
        <div className="space-y-6">
          {DAYS.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {MEAL_TYPES.map((mealType) => (
                    <div key={mealType} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium capitalize">{mealType}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleAddMeal(day, mealType)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {mealPlan[day]?.[mealType]?.map((meal: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-start p-2 rounded border bg-card text-sm group"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{meal.dishName}</div>
                              <div className="text-xs text-muted-foreground">
                                {meal.calories} kcal
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveMeal(day, mealType, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )) || (
                          <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">
                            No meals planned
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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