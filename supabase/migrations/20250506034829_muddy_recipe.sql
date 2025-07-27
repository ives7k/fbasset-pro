/*
  # Fix user profile creation and asset management

  1. Changes
    - Add trigger to automatically create profile when user signs up
    - Update assets table to use user_id from auth.users
    - Add NOT NULL constraint to user_id in assets table
    - Update RLS policies to use auth.uid()

  2. Security
    - Ensure RLS policies use auth.uid() consistently
    - Maintain data integrity with foreign key constraints
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
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

-- Ensure user_id in assets references auth.users
ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_user_id_fkey,
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT assets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Update RLS policies to use auth.uid()
DROP POLICY IF EXISTS "Users can create their own assets" ON assets;
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

CREATE POLICY "Users can create their own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);