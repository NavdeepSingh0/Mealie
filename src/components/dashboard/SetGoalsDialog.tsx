import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SetGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  existingGoals?: any;
}

export function SetGoalsDialog({ open, onOpenChange, onSaved, existingGoals }: SetGoalsDialogProps) {
  const [calories, setCalories] = useState("2000");
  const [protein, setProtein] = useState("50");
  const [fiber, setFiber] = useState("25");
  const [sugar, setSugar] = useState("50");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (existingGoals) {
      setCalories(existingGoals.daily_calorie_goal?.toString() || "2000");
      setProtein(existingGoals.daily_protein_goal?.toString() || "50");
      setFiber(existingGoals.daily_fiber_goal?.toString() || "25");
      setSugar(existingGoals.daily_sugar_limit?.toString() || "50");
    }
  }, [existingGoals]);

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save goals");
      return;
    }

    setLoading(true);

    const goalData = {
      user_id: user.id,
      daily_calorie_goal: parseInt(calories),
      daily_protein_goal: parseInt(protein),
      daily_fiber_goal: parseInt(fiber),
      daily_sugar_limit: parseInt(sugar),
    };

    const { error } = existingGoals
      ? await supabase
          .from("user_profiles")
          .update(goalData)
          .eq("user_id", user.id)
      : await supabase
          .from("user_profiles")
          .insert([goalData]);

    setLoading(false);

    if (error) {
      console.error("Failed to save goals:", error);
      toast.error(error.message || "Failed to save goals");
    } else {
      toast.success("Goals saved successfully!");
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Daily Nutrition Goals</DialogTitle>
          <DialogDescription>
            Set your daily nutrition targets to track your progress
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="calories">Daily Calorie Goal (kcal)</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="2000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="protein">Daily Protein Goal (g)</Label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fiber">Daily Fiber Goal (g)</Label>
            <Input
              id="fiber"
              type="number"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              placeholder="25"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sugar">Daily Sugar Limit (g)</Label>
            <Input
              id="sugar"
              type="number"
              value={sugar}
              onChange={(e) => setSugar(e.target.value)}
              placeholder="50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Goals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
