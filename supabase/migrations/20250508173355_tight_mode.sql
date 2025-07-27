/*
  # Corrigir criação de usuário e perfil

  1. Alterações
    - Melhorar função de criação de perfil
    - Adicionar tratamento de erros mais robusto
    - Garantir que o perfil seja criado corretamente
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Verificar se já existe um perfil
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.id
  ) INTO profile_exists;

  -- Se não existir, criar novo perfil
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        name,
        structure_name,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'Estrutura Principal',
        NOW(),
        NOW()
      );
    EXCEPTION WHEN others THEN
      -- Log detalhes do erro mas permite que a criação do usuário continue
      RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure all required columns are properly configured
DO $$ 
BEGIN
  -- Ensure email column exists and is properly configured
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;

  -- Make email not null but allow existing null values temporarily
  ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
  
  -- Update any existing profiles that might be missing email
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
  AND p.email IS NULL;

  -- Now make email not null
  ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

END $$;