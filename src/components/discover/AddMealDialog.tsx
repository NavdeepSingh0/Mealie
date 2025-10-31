import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AddMealDialogProps {
  dish: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMealDialog({ dish, open, onOpenChange }: AddMealDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mealType, setMealType] = useState("breakfast");
  const [servingSize, setServingSize] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!dish) return;

    setLoading(true);
    const userId = user?.id || "demo-user";
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from("user_meals")
      .insert([{
        user_id: userId,
        dish_id: dish.id,
        meal_type: mealType,
        serving_size: parseFloat(servingSize),
        consumed_at: today,
      }]);

    setLoading(false);

    if (error) {
      toast.error("Failed to add meal");
      console.error(error);
    } else {
      toast.success("Meal added successfully!");
      onOpenChange(false);
      navigate("/");
    }
  };

  if (!dish) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Add {dish["Dish Name"]} to your meals
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="meal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serving-size">Serving Size</Label>
            <Input
              id="serving-size"
              type="number"
              step="0.5"
              min="0.5"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
            />
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm font-medium">Nutrition per serving:</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Calories: {Math.round(dish["Calories (kcal)"] * parseFloat(servingSize))}</div>
              <div>Protein: {Math.round(dish["Protein (g)"] * parseFloat(servingSize))}g</div>
              <div>Carbs: {Math.round(dish["Carbohydrates (g)"] * parseFloat(servingSize))}g</div>
              <div>Fats: {Math.round(dish["Fats (g)"] * parseFloat(servingSize))}g</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add Meal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
