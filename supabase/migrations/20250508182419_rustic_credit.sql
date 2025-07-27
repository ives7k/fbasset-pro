/*
  # Add user trigger for profile creation

  1. New Functions
    - `handle_new_user`: Function to automatically create a profile when a new user is created
  
  2. Triggers
    - Add trigger on auth.users table to call handle_new_user function
    
  3. Security
    - Function is set to be executed with security definer privileges
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create the trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();