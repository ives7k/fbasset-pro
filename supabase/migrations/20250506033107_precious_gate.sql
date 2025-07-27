/*
  # Add user management and asset ownership

  1. Changes
    - Add user_id column to assets table
    - Add foreign key constraint to link assets with auth.users
    - Update RLS policies to enforce user ownership
*/

-- Add user_id column to assets table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE assets ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can create their own assets" ON assets;
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

-- Create new RLS policies with user_id checks
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