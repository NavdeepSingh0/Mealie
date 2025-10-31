BEGIN;
-- Drop FK to allow changing type (demo-friendly schema)
ALTER TABLE public.grocery_lists DROP CONSTRAINT IF EXISTS grocery_lists_user_id_fkey;

-- Drop policy first
DROP POLICY IF EXISTS "Users can manage their own grocery lists" ON public.grocery_lists;

-- Change user_id to text
ALTER TABLE public.grocery_lists
ALTER COLUMN user_id TYPE text USING user_id::text;

-- Re-enable RLS and create compatible policy
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own grocery lists"
ON public.grocery_lists
FOR ALL
USING ((user_id = 'demo-user') OR (user_id = (auth.uid())::text))
WITH CHECK ((user_id = 'demo-user') OR (user_id = (auth.uid())::text));

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_completed
ON public.grocery_lists (user_id, completed);
COMMIT;