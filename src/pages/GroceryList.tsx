import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBasket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const GroceryList = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [groceryItems, setGroceryItems] = useState<any>({});
  const [aiGroceryItems, setAiGroceryItems] = useState<any>({});
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const load = async () => {
        await loadAIGroceryItems();
        await loadMealPlan();
      };
      load();
    }
  }, [user]);

  const loadMealPlan = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setMealPlan(data);
      generateGroceryList(data.items);
    }
  };

  const generateGroceryList = async (planItems: any) => {
    // Extract all dishes from the meal plan
    const allDishes: string[] = [];
    Object.values(planItems).forEach((day: any) => {
      Object.values(day).forEach((meals: any) => {
        meals.forEach((meal: any) => {
          allDishes.push(meal.dishName);
        });
      });
    });

    // For each dish, look up ingredients from recipes
    const ingredientsMap = new Map<string, number>();

    for (const dishName of allDishes) {
      // Try to find recipes for this dish
      const { data: recipes } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_ingredients (
            quantity,
            unit,
            ingredients (
              ingredient_name
            )
          )
        `)
        .ilike("recipe_name", `%${dishName}%`)
        .limit(1)
        .maybeSingle();

      if (recipes && recipes.recipe_ingredients) {
        recipes.recipe_ingredients.forEach((ri: any) => {
          const ingredientName = ri.ingredients?.ingredient_name;
          if (ingredientName) {
            const currentQty = ingredientsMap.get(ingredientName) || 0;
            ingredientsMap.set(ingredientName, currentQty + ri.quantity);
          }
        });
      }
    }

    // Convert map to array
    const items = Array.from(ingredientsMap.entries()).map(([name, quantity]) => ({
      name,
      quantity: Math.round(quantity),
      checked: false,
      category: getCategoryForIngredient(name),
    }));

    // Group by category
    const grouped = items.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    setGroceryItems(grouped);
  };

  const getCategoryForIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("rice") || lowerName.includes("flour") || lowerName.includes("bread")) {
      return "Grains & Bread";
    }
    if (lowerName.includes("chicken") || lowerName.includes("meat") || lowerName.includes("fish")) {
      return "Protein";
    }
    if (lowerName.includes("onion") || lowerName.includes("tomato") || lowerName.includes("potato") || 
        lowerName.includes("vegetable")) {
      return "Vegetables";
    }
    if (lowerName.includes("oil") || lowerName.includes("ghee") || lowerName.includes("butter")) {
      return "Oils & Fats";
    }
    if (lowerName.includes("spice") || lowerName.includes("masala") || lowerName.includes("salt")) {
      return "Spices";
    }
    return "Other";
  };

  const loadAIGroceryItems = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("for_date", today);

    if (data && data.length > 0) {
      const grouped = data.reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          id: item.id,
          name: item.item_name,
          quantity: item.quantity,
          checked: item.checked,
        });
        return acc;
      }, {});
      setAiGroceryItems(grouped);
    }
  };

  const toggleItem = (category: string, index: number, isAI: boolean = false) => {
    if (isAI) {
      setAiGroceryItems((prev: any) => {
        const updated = { ...prev };
        updated[category][index].checked = !updated[category][index].checked;
        
        // Update in database
        const item = updated[category][index];
        supabase
          .from("grocery_items")
          .update({ checked: item.checked })
          .eq("id", item.id);
        
        return updated;
      });
    } else {
      setGroceryItems((prev: any) => {
        const updated = { ...prev };
        updated[category][index].checked = !updated[category][index].checked;
        return updated;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const countItems = (groups: any) =>
    (Object.values(groups) as any[][]).reduce(
      (acc, items) => ({ total: acc.total + items.length, done: acc.done + items.filter((i) => i.checked).length }),
      { total: 0, done: 0 }
    );
  const a = countItems(aiGroceryItems);
  const b = countItems(groceryItems);
  const total = a.total + b.total;
  const done = a.done + b.done;
  const isEmpty = Object.keys(aiGroceryItems).length === 0 && Object.keys(groceryItems).length === 0;

  const renderGroups = (groups: any, isAI: boolean, suffix: string) =>
    Object.entries(groups).map(([category, items]: [string, any]) => {
      const checked = items.filter((i: any) => i.checked).length;
      return (
        <section key={`${isAI ? "ai" : "plan"}-${category}`} className="paper p-5 md:p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-xl">{category}</h3>
            <p className="text-sm text-muted-foreground tabular-nums">
              {checked} of {items.length}
            </p>
          </div>
          <ul className="divide-y divide-border/70">
            {items.map((item: any, index: number) => {
              const id = `${isAI ? "ai" : "plan"}-${category}-${index}`;
              return (
                <li key={index}>
                  <label htmlFor={id} className="flex cursor-pointer items-center gap-4 py-3">
                    <Checkbox
                      id={id}
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(category, index, isAI)}
                      className="h-5 w-5 rounded-md"
                    />
                    <span className={cn("flex-1 font-medium", item.checked && "text-muted-foreground line-through")}>
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {item.quantity}
                      {suffix}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      );
    });

  return (
    <div className="page max-w-3xl space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Shopping</p>
          <h1 className="page-title mt-3">Grocery list</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Ingredients for today&rsquo;s meals and your weekly plan.
          </p>
        </div>
        <Button onClick={() => navigate("/ai-chat?action=groceries")} variant="hero">
          <Sparkles className="h-4 w-4" />
          Generate a list
        </Button>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border-2 border-dashed bg-card/60 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/25 text-secondary-foreground">
            <ShoppingBasket className="h-7 w-7" />
          </div>
          <p className="font-display text-2xl">Your list is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Build a meal plan, or ask the assistant to generate today&rsquo;s groceries.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => navigate("/meal-plan")}>Plan the week</Button>
            <Button variant="hero" onClick={() => navigate("/ai-chat?action=groceries")}>Generate a list</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="paper p-5 md:p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-xl font-semibold">{total - done === 0 ? "All done" : `${total - done} left to buy`}</p>
              <p className="text-sm text-muted-foreground tabular-nums">{done} of {total} ticked</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Items ticked" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
              <div className="h-full rounded-full bg-tertiary transition-[width] duration-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
            </div>
          </div>

          {Object.keys(aiGroceryItems).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl">Today&rsquo;s list</h2>
              {renderGroups(aiGroceryItems, true, "")}
            </div>
          )}

          {Object.keys(groceryItems).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl">For the weekly plan</h2>
              {renderGroups(groceryItems, false, " g")}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroceryList;
