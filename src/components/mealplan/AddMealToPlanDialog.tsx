import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

interface AddMealToPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded: (dishData: any) => void;
  slot: any;
}

export function AddMealToPlanDialog({ open, onOpenChange, onMealAdded, slot }: AddMealToPlanDialogProps) {
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      loadDishes();
    }
  }, [open]);

  const loadDishes = async () => {
    const { data, error } = await supabase
      .from("nutrition_info")
      .select("*")
      .order("Dish Name")
      .limit(50);

    if (data) {
      setDishes(data);
    }
  };

  const handleSelect = (dish: any) => {
    setSelectedDish(dish);
  };

  const handleAdd = () => {
    if (!selectedDish) return;

    onMealAdded({
      dishId: selectedDish.id,
      dishName: selectedDish["Dish Name"],
      calories: Math.round(selectedDish["Calories (kcal)"] || 0),
      protein: Math.round(selectedDish["Protein (g)"] || 0),
      carbs: Math.round(selectedDish["Carbohydrates (g)"] || 0),
      fats: Math.round(selectedDish["Fats (g)"] || 0),
    });

    setSelectedDish(null);
    setSearchQuery("");
  };

  const filteredDishes = dishes.filter(dish =>
    dish["Dish Name"]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!slot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Add a meal to {slot.day} - {slot.mealType}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Command className="rounded-lg border">
            <CommandInput 
              placeholder="Search dishes..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className={selectedDish ? "max-h-[180px]" : "max-h-[300px]"}>
              <CommandEmpty>No dishes found.</CommandEmpty>
              <CommandGroup>
                {filteredDishes.slice(0, 10).map((dish) => (
                  <CommandItem
                    key={dish.id}
                    onSelect={() => handleSelect(dish)}
                    className="cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{dish["Dish Name"]}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(dish["Calories (kcal)"] || 0)} kcal • 
                        {Math.round(dish["Protein (g)"] || 0)}g protein
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {selectedDish && (
            <div className="rounded-lg border p-4 bg-card">
              <div className="font-semibold mb-3 text-base">{selectedDish["Dish Name"]}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories:</span>
                  <span className="font-medium">{Math.round(selectedDish["Calories (kcal)"] || 0)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein:</span>
                  <span className="font-medium">{Math.round(selectedDish["Protein (g)"] || 0)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs:</span>
                  <span className="font-medium">{Math.round(selectedDish["Carbohydrates (g)"] || 0)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fats:</span>
                  <span className="font-medium">{Math.round(selectedDish["Fats (g)"] || 0)}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={!selectedDish}>
            Add to Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
