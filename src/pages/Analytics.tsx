import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Frown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const Analytics = () => {
  const { user, loading } = useAuth();
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  useEffect(() => {
    if (!user) return;
    loadWeeklyData();
    calculateAchievements();
  }, [user, viewMode]);

  const loadWeeklyData = async () => {
    if (!user) return;
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: meals, error } = await supabase
      .from("user_meals")
      .select(`
        *,
        nutrition_info (*)
      `)
      .eq("user_id", user.id)
      .gte("consumed_at", weekAgo.toISOString().split('T')[0])
      .lte("consumed_at", today.toISOString().split('T')[0]);

    if (meals) {
      // Group by day
      const dayMap = new Map();
      meals.forEach((meal) => {
        const day = meal.consumed_at;
        if (!dayMap.has(day)) {
          dayMap.set(day, { date: day, calories: 0, protein: 0, carbs: 0, fats: 0 });
        }
        const dayData = dayMap.get(day);
        const servings = meal.serving_size || 1;
        const dish = meal.nutrition_info;
        
        dayData.calories += (dish?.["Calories (kcal)"] || 0) * servings;
        dayData.protein += (dish?.["Protein (g)"] || 0) * servings;
        dayData.carbs += (dish?.["Carbohydrates (g)"] || 0) * servings;
        dayData.fats += (dish?.["Fats (g)"] || 0) * servings;
      });

      // Fill in missing days with 0s
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (dayMap.has(dateStr)) {
          const data = dayMap.get(dateStr);
          weekData.push({
            name: dayName,
            calories: Math.round(data.calories),
            protein: Math.round(data.protein),
            carbs: Math.round(data.carbs),
            fats: Math.round(data.fats),
          });
        } else {
          weekData.push({
            name: dayName,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          });
        }
      }

      setWeeklyData(weekData);
    }
  };

  const calculateAchievements = async () => {
    if (!user) return;
    
    // Get user profile goals
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) return;

    const today = new Date();
    const startDate = viewMode === 'daily' ? today : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const daysCount = viewMode === 'daily' ? 1 : 7;

    const { data: meals } = await supabase
      .from("user_meals")
      .select(`
        *,
        nutrition_info (*)
      `)
      .eq("user_id", user.id)
      .gte("consumed_at", startDate.toISOString().split('T')[0]);

    if (!meals) return;

    // Calculate daily totals
    const dailyTotals: any[] = [];
    const iterations = viewMode === 'daily' ? 0 : 6;
    for (let i = iterations; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMeals = meals.filter(m => m.consumed_at === dateStr);
      const dayTotal = dayMeals.reduce((acc, meal) => {
        const servings = meal.serving_size || 1;
        const dish = meal.nutrition_info;
        return {
          calories: acc.calories + ((dish?.["Calories (kcal)"] || 0) * servings),
          protein: acc.protein + ((dish?.["Protein (g)"] || 0) * servings),
          fiber: acc.fiber + ((dish?.["Fibre (g)"] || 0) * servings),
          hasMeals: true,
        };
      }, { calories: 0, protein: 0, fiber: 0, hasMeals: false });

      if (dayTotal.hasMeals || viewMode === 'daily') {
        dailyTotals.push(dayTotal);
      }
    }

    // Calculate achievement percentages
    const achievementsList = [];

    // Calorie Goal Achievement - calculate progress toward goal
    const totalCalories = dailyTotals.reduce((sum, day) => sum + day.calories, 0);
    const avgCalories = dailyTotals.length > 0 ? totalCalories / dailyTotals.length : 0;
    const caloriePercentage = profile.daily_calorie_goal > 0 
      ? Math.min((avgCalories / profile.daily_calorie_goal) * 100, 100) 
      : 0;

    achievementsList.push({
      name: "Calorie Goal",
      description: `${Math.round(avgCalories)} / ${profile.daily_calorie_goal} kcal`,
      percentage: caloriePercentage,
      tier: getTier(caloriePercentage),
    });

    // Protein Goal Achievement - calculate progress toward goal
    const totalProtein = dailyTotals.reduce((sum, day) => sum + day.protein, 0);
    const avgProtein = dailyTotals.length > 0 ? totalProtein / dailyTotals.length : 0;
    const proteinPercentage = profile.daily_protein_goal > 0 
      ? Math.min((avgProtein / profile.daily_protein_goal) * 100, 100) 
      : 0;

    achievementsList.push({
      name: "Protein Goal",
      description: `${Math.round(avgProtein)}g / ${profile.daily_protein_goal}g`,
      percentage: proteinPercentage,
      tier: getTier(proteinPercentage),
    });

    // Fiber Goal Achievement - calculate progress toward goal
    const totalFiber = dailyTotals.reduce((sum, day) => sum + day.fiber, 0);
    const avgFiber = dailyTotals.length > 0 ? totalFiber / dailyTotals.length : 0;
    const fiberPercentage = profile.daily_fiber_goal > 0 
      ? Math.min((avgFiber / profile.daily_fiber_goal) * 100, 100) 
      : 0;

    achievementsList.push({
      name: "Fiber Goal",
      description: `${Math.round(avgFiber)}g / ${profile.daily_fiber_goal}g`,
      percentage: fiberPercentage,
      tier: getTier(fiberPercentage),
    });

    // Consistency Achievement
    const trackedDays = dailyTotals.filter(day => day.calories > 0).length;
    const consistencyPercentage = (trackedDays / daysCount) * 100;

    achievementsList.push({
      name: "Tracking Consistency",
      description: "Logged meals daily",
      percentage: consistencyPercentage,
      tier: getTier(consistencyPercentage),
    });

    setAchievements(achievementsList);
  };

  const getTier = (percentage: number) => {
    if (percentage >= 100) return "gold";
    if (percentage >= 75) return "silver";
    if (percentage >= 50) return "bronze";
    return "none";
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "gold": return <Trophy className="h-6 w-6 text-accent" />;
      case "silver": return <Medal className="h-6 w-6 text-gray-400" />;
      case "bronze": return <Award className="h-6 w-6 text-orange-600" />;
      default: return <Frown className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case "gold": return "bg-accent/20 text-accent border-accent";
      case "silver": return "bg-gray-100 text-gray-600 border-gray-300";
      case "bronze": return "bg-orange-100 text-orange-700 border-orange-300";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-text">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your achievements and progress</p>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{viewMode === 'daily' ? "Today's" : "This Week's"} Achievements</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode">Daily</Label>
              <Switch
                id="view-mode"
                checked={viewMode === 'weekly'}
                onCheckedChange={(checked) => setViewMode(checked ? 'weekly' : 'daily')}
              />
              <Label htmlFor="view-mode">Weekly</Label>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`border-2 ${getTierBadgeClass(achievement.tier)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    {getTierIcon(achievement.tier)}
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(achievement.percentage)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tier: {achievement.tier === "none" ? "Keep going!" : achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Weekly Nutrition Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Nutrition Trend</CardTitle>
            <CardDescription>Your daily nutrition intake over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                    stroke="hsl(var(--border))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--popover-foreground))"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: "hsl(var(--foreground))" }} />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Calories"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Protein (g)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    stroke="hsl(var(--tertiary))" 
                    strokeWidth={2}
                    name="Carbs (g)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tier Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">Gold</div>
                  <div className="text-sm text-muted-foreground">100%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">Silver</div>
                  <div className="text-sm text-muted-foreground">75-99%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Bronze</div>
                  <div className="text-sm text-muted-foreground">50-74%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Frown className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Keep going!</div>
                  <div className="text-sm text-muted-foreground">&lt;50%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
