-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and manage their own profile
CREATE POLICY "Users can manage their own profile"
ON public.user_profiles
FOR ALL
USING (user_id = 'demo-user' OR user_id = (auth.uid())::text);

-- Enable RLS on user_meals
ALTER TABLE public.user_meals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own meals
CREATE POLICY "Users can manage their own meals"
ON public.user_meals
FOR ALL
USING (user_id = 'demo-user' OR user_id = (auth.uid())::text);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites"
ON public.user_favorites
FOR ALL
USING (user_id = 'demo-user' OR user_id = (auth.uid())::text);

-- Make nutrition data publicly readable
ALTER TABLE public.nutrition_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutrition info is publicly readable"
ON public.nutrition_info
FOR SELECT
USING (true);

-- Make recipes publicly readable
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are publicly readable"
ON public.recipes
FOR SELECT
USING (true);

-- Make recipe ingredients publicly readable
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe ingredients are publicly readable"
ON public.recipe_ingredients
FOR SELECT
USING (true);

-- Make ingredients publicly readable
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredients are publicly readable"
ON public.ingredients
FOR SELECT
USING (true);

-- Make nutrition dataset publicly readable
ALTER TABLE public.nutrition_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutrition dataset is publicly readable"
ON public.nutrition_dataset
FOR SELECT
USING (true);

-- Make meal types publicly readable
ALTER TABLE public.meal_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meal types are publicly readable"
ON public.meal_types
FOR SELECT
USING (true);