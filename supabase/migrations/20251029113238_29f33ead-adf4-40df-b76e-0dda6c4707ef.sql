DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='Users can insert their own user_profiles row'
  ) THEN
    CREATE POLICY "Users can insert their own user_profiles row"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((user_id = auth.uid()::text) OR (user_id = 'demo-user'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_profiles' AND policyname='Users can update their own user_profiles row'
  ) THEN
    CREATE POLICY "Users can update their own user_profiles row"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid()::text OR user_id = 'demo-user')
    WITH CHECK (user_id = auth.uid()::text OR user_id = 'demo-user');
  END IF;
END $$;