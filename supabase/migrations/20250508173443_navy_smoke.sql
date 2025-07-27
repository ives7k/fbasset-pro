/*
  # Corrigir criação de usuário e perfil

  1. Alterações
    - Melhorar função de criação de perfil com retry
    - Garantir que todos os campos obrigatórios sejam preenchidos
    - Adicionar logs para debug
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation with retry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  current_try int := 0;
  profile_created boolean := false;
BEGIN
  WHILE current_try < max_retries AND NOT profile_created LOOP
    BEGIN
      current_try := current_try + 1;
      
      -- Verificar se já existe um perfil
      IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = NEW.id
      ) THEN
        profile_created := true;
        RAISE LOG 'Perfil já existe para usuário %', NEW.id;
        RETURN NEW;
      END IF;

      -- Criar novo perfil
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
        COALESCE(
          NEW.raw_user_meta_data->>'name',
          split_part(NEW.email, '@', 1)
        ),
        'Estrutura Principal',
        NOW(),
        NOW()
      );

      profile_created := true;
      RAISE LOG 'Perfil criado com sucesso para usuário % na tentativa %', NEW.id, current_try;

    EXCEPTION WHEN others THEN
      -- Log error details
      RAISE LOG 'Tentativa % de criar perfil para usuário % falhou: %', 
        current_try, NEW.id, SQLERRM;
      
      -- Wait a bit before retrying (100ms, 200ms, 300ms)
      PERFORM pg_sleep(current_try * 0.1);
    END;
  END LOOP;

  -- Even if profile creation fails, we still return NEW to allow user creation
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
  -- Update any existing profiles that might be missing email
  UPDATE public.profiles p
  SET 
    email = u.email,
    name = COALESCE(p.name, split_part(u.email, '@', 1)),
    structure_name = COALESCE(p.structure_name, 'Estrutura Principal'),
    updated_at = NOW()
  FROM auth.users u
  WHERE p.id = u.id
  AND (p.email IS NULL OR p.name IS NULL OR p.structure_name IS NULL);

  -- Ensure columns are not null
  ALTER TABLE public.profiles 
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN structure_name SET NOT NULL;

END $$;