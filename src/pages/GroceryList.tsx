import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Grocery List</h1>
            <p className="text-muted-foreground mt-2">
              Ingredients for today's meals and your weekly plan
            </p>
          </div>
          <Button onClick={() => navigate("/ai-chat?action=groceries")} size="sm" className="w-full md:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="md:inline">Generate List</span>
          </Button>
        </div>

        {Object.keys(aiGroceryItems).length === 0 && Object.keys(groceryItems).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No grocery list yet. Create a meal plan or use AI to generate today's grocery list!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.keys(aiGroceryItems).length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Today's AI-Generated List</h2>
                </div>
                {Object.entries(aiGroceryItems).map(([category, items]: [string, any]) => (
                  <Card key={`ai-${category}`}>
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>
                        {items.filter((i: any) => i.checked).length} of {items.length} items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItem(category, index, true)}
                            />
                            <div className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {Object.keys(groceryItems).length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Weekly Meal Plan Ingredients</h2>
                </div>
                {Object.entries(groceryItems).map(([category, items]: [string, any]) => (
                  <Card key={`plan-${category}`}>
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>
                        {items.filter((i: any) => i.checked).length} of {items.length} items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItem(category, index, false)}
                            />
                            <div className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity}g
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryList;