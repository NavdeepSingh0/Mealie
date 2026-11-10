import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

  const tierStyle: Record<string, { icon: JSX.Element; chip: string; bar: string; label: string }> = {
    gold: {
      icon: <Trophy className="h-5 w-5" />,
      chip: "bg-secondary/25 text-[hsl(32_80%_26%)] dark:text-secondary",
      bar: "bg-secondary",
      label: "Gold",
    },
    silver: {
      icon: <Medal className="h-5 w-5" />,
      chip: "bg-muted text-foreground",
      bar: "bg-muted-foreground/70",
      label: "Silver",
    },
    bronze: {
      icon: <Award className="h-5 w-5" />,
      chip: "bg-primary/10 text-primary",
      bar: "bg-primary",
      label: "Bronze",
    },
    none: {
      icon: <Frown className="h-5 w-5" />,
      chip: "bg-muted text-muted-foreground",
      bar: "bg-border",
      label: "Keep going",
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const axis = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };

  return (
    <div className="page space-y-10">
      {/* Header */}
      <div>
        <p className="eyebrow">Progress</p>
        <h1 className="page-title mt-3">Trends</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">How your intake and habits are tracking against your goals.</p>
      </div>

      {/* Achievements */}
      <section aria-labelledby="ach-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="ach-heading" className="text-2xl">
            {viewMode === "daily" ? "Today" : "This week"}
          </h2>
          <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2">
            <Label htmlFor="view-mode" className="text-sm">Daily</Label>
            <Switch
              id="view-mode"
              checked={viewMode === "weekly"}
              onCheckedChange={(checked) => setViewMode(checked ? "weekly" : "daily")}
            />
            <Label htmlFor="view-mode" className="text-sm">Weekly</Label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement, index) => {
            const t = tierStyle[achievement.tier] ?? tierStyle.none;
            return (
              <div key={index} className="paper flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{achievement.name}</p>
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.chip)} aria-hidden="true">
                    {t.icon}
                  </span>
                </div>
                <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
                  {Math.round(achievement.percentage)}
                  <span className="text-2xl text-muted-foreground">%</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${Math.min(achievement.percentage, 100)}%` }} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{achievement.description}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.label}</p>
              </div>
            );
          })}
          {achievements.length === 0 && (
            <p className="col-span-full rounded-2xl border-2 border-dashed bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
              Log a few meals and your streaks will show up here.
            </p>
          )}
        </div>
      </section>

      {/* Weekly Nutrition Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Last 7 days</CardTitle>
          <CardDescription>Daily calories, protein and carbs.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
          <div className="h-[300px] w-full md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis tick={axis} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "13px", paddingTop: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="hsl(var(--macro-calories))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Calories" />
                <Line type="monotone" dataKey="protein" stroke="hsl(var(--macro-protein))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Protein (g)" />
                <Line type="monotone" dataKey="carbs" stroke="hsl(var(--macro-carbs))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Carbs (g)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tier legend */}
      <section aria-label="How tiers work" className="paper p-5 md:p-6">
        <p className="eyebrow mb-4">How tiers work</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["gold", "100%"],
            ["silver", "75 to 99%"],
            ["bronze", "50 to 74%"],
            ["none", "Under 50%"],
          ].map(([tier, range]) => {
            const t = tierStyle[tier];
            return (
              <li key={tier} className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.chip)} aria-hidden="true">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-sm text-muted-foreground">{range}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default Analytics;
