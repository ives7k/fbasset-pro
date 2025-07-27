/*
  # Fix profile creation and asset management

  1. Changes
    - Drop existing profile trigger and recreate it
    - Ensure profile is created with proper timestamps
    - Update assets table to properly reference auth.users
    - Update RLS policies to use auth.uid() consistently

  2. Security
    - Maintain RLS policies for both profiles and assets
    - Ensure proper user ownership checks
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update assets table to properly reference auth.users
ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_user_id_fkey,
  ADD CONSTRAINT assets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Recreate RLS policies with proper auth.uid() checks
DROP POLICY IF EXISTS "Users can create their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;

CREATE POLICY "Users can create their own assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);