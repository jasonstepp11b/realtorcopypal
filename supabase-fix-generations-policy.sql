-- First, check if the policy exists and drop it if it does
DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;

-- Create the INSERT policy for the generations table
CREATE POLICY "Users can insert their own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify that RLS is enabled on the generations table
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Create other policies if they don't exist
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
CREATE POLICY "Users can view their own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own generations" ON public.generations;
CREATE POLICY "Users can update their own generations" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own generations" ON public.generations;
CREATE POLICY "Users can delete their own generations" ON public.generations
  FOR DELETE USING (auth.uid() = user_id); 