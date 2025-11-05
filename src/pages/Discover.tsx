import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, TrendingDown } from "lucide-react";
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

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    filterDishes();
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-text">Discover Dishes</h1>
          <p className="text-muted-foreground mt-2">Find and track Indian dishes</p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={calorieFilter} onValueChange={setCalorieFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Calories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calories</SelectItem>
              <SelectItem value="low">Low (&lt;200)</SelectItem>
              <SelectItem value="medium">Medium (200-400)</SelectItem>
              <SelectItem value="high">High (&gt;400)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={proteinFilter} onValueChange={setProteinFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Protein" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Protein</SelectItem>
              <SelectItem value="low">Low (&lt;10g)</SelectItem>
              <SelectItem value="medium">Medium (10-20g)</SelectItem>
              <SelectItem value="high">High (&gt;20g)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="text-sm text-muted-foreground">
          Found {filteredDishes.length} dishes
        </div>

        {/* Dishes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <Card key={dish.id} className="glass-card hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{dish["Dish Name"]}</CardTitle>
                <CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{Math.round(dish["Calories (kcal)"] || 0)} kcal</Badge>
                    <Badge variant="outline">{Math.round(dish["Protein (g)"] || 0)}g protein</Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Carbs</div>
                    <div className="font-medium">{Math.round(dish["Carbohydrates (g)"] || 0)}g</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fats</div>
                    <div className="font-medium">{Math.round(dish["Fats (g)"] || 0)}g</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fiber</div>
                    <div className="font-medium">{Math.round(dish["Fibre (g)"] || 0)}g</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Sodium</div>
                    <div className="font-medium">{Math.round(dish["Sodium (mg)"] || 0)}mg</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddMeal(dish)}
                  >
                    Add to Meals
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFindSimilar(dish)}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Similar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleHealthierAlternative(dish)}
                    >
                      <TrendingDown className="mr-1 h-3 w-3" />
                      Healthier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No dishes found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <AddMealDialog
        dish={selectedDish}
        open={showAddMealDialog}
        onOpenChange={setShowAddMealDialog}
      />
    </div>
  );
};

export default Discover;