import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MealThumb } from "@/components/MealThumb";
import { Plus, Search, Sparkles, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddMealDialog } from "@/components/discover/AddMealDialog";
import { useAuth } from "@/hooks/useAuth";

const Discover = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [dishes, setDishes] = useState<any[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [calorieFilter, setCalorieFilter] = useState("all");
  const [proteinFilter, setProteinFilter] = useState("all");
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const PAGE_SIZE = 24;
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    filterDishes();
    setVisible(PAGE_SIZE);
  }, [searchQuery, calorieFilter, proteinFilter, dishes]);

  const loadDishes = async () => {
    const { data, error } = await supabase
      .from("nutrition_info")
      .select("*")
      .order("Dish Name");

    if (data) {
      setDishes(data);
    } else if (error) {
      console.error("Error loading dishes:", error);
      toast.error("Failed to load dishes");
    }
  };

  const filterDishes = () => {
    let filtered = [...dishes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(dish =>
        dish["Dish Name"]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Calorie filter
    if (calorieFilter !== "all") {
      filtered = filtered.filter(dish => {
        const calories = dish["Calories (kcal)"] || 0;
        switch (calorieFilter) {
          case "low": return calories < 200;
          case "medium": return calories >= 200 && calories < 400;
          case "high": return calories >= 400;
          default: return true;
        }
      });
    }

    // Protein filter
    if (proteinFilter !== "all") {
      filtered = filtered.filter(dish => {
        const protein = dish["Protein (g)"] || 0;
        switch (proteinFilter) {
          case "low": return protein < 10;
          case "medium": return protein >= 10 && protein < 20;
          case "high": return protein >= 20;
          default: return true;
        }
      });
    }

    setFilteredDishes(filtered);
  };

  const handleAddMeal = (dish: any) => {
    setSelectedDish(dish);
    setShowAddMealDialog(true);
  };

  const handleFindSimilar = (dish: any) => {
    navigate(`/ai-chat?dish=${encodeURIComponent(dish["Dish Name"])}&action=similar`);
  };

  const handleHealthierAlternative = (dish: any) => {
    navigate(`/ai-chat?dish=${encodeURIComponent(dish["Dish Name"])}&action=healthier`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const stats = (dish: any) => [
    ["Carbs", `${Math.round(dish["Carbohydrates (g)"] || 0)} g`],
    ["Fats", `${Math.round(dish["Fats (g)"] || 0)} g`],
    ["Fibre", `${Math.round(dish["Fibre (g)"] || 0)} g`],
    ["Sodium", `${Math.round(dish["Sodium (mg)"] || 0)} mg`],
  ];

  return (
    <div className="page space-y-8">
      {/* Header */}
      <div>
        <p className="eyebrow">Dish database</p>
        <h1 className="page-title mt-3">Discover dishes</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Search Indian dishes, compare calories and protein, and add one to today.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes, e.g. paneer"
            aria-label="Search dishes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
        <Select value={calorieFilter} onValueChange={setCalorieFilter}>
          <SelectTrigger aria-label="Filter by calories">
            <SelectValue placeholder="Calories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any calories</SelectItem>
            <SelectItem value="low">Under 200 kcal</SelectItem>
            <SelectItem value="medium">200 to 400 kcal</SelectItem>
            <SelectItem value="high">Over 400 kcal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={proteinFilter} onValueChange={setProteinFilter}>
          <SelectTrigger aria-label="Filter by protein">
            <SelectValue placeholder="Protein" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any protein</SelectItem>
            <SelectItem value="low">Under 10 g</SelectItem>
            <SelectItem value="medium">10 to 20 g</SelectItem>
            <SelectItem value="high">Over 20 g</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filteredDishes.length} {filteredDishes.length === 1 ? "dish" : "dishes"}
      </p>

      {/* Dishes grid */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.slice(0, visible).map((dish) => (
          <li key={dish.id} className="paper paper-hover flex flex-col overflow-hidden">
            <MealThumb name={dish["Dish Name"]} size="lg" />
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-xl leading-snug">{dish["Dish Name"]}</h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tabular-nums text-primary">
                  {Math.round(dish["Calories (kcal)"] || 0)} kcal
                </span>
                <span className="rounded-full bg-macro-protein/15 px-3 py-1 text-xs font-semibold tabular-nums text-macro-protein">
                  {Math.round(dish["Protein (g)"] || 0)} g protein
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-border/70 pt-4 text-center">
                {stats(dish).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex-1" />
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleAddMeal(dish)}
              >
                <Plus className="h-4 w-4" />
                Add to today
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleFindSimilar(dish)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Similar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleHealthierAlternative(dish)}>
                  <TrendingDown className="h-3.5 w-3.5" />
                  Lighter
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filteredDishes.length > visible && (
        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show more dishes
          </Button>
        </div>
      )}

      {filteredDishes.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed bg-card/60 px-6 py-14 text-center">
          <p className="font-display text-2xl">No dishes match</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different word or clear a filter.</p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCalorieFilter("all");
              setProteinFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <AddMealDialog
        dish={selectedDish}
        open={showAddMealDialog}
        onOpenChange={setShowAddMealDialog}
      />
    </div>
  );
};

export default Discover;
