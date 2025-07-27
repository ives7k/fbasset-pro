/*
  # Corrigir criação de usuário e perfil

  1. Alterações
    - Melhorar função de criação de perfil com retry
    - Garantir criação síncrona do perfil
    - Adicionar logs detalhados
    - Corrigir problemas de race condition
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation with retry and better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  current_try int := 0;
  profile_created boolean := false;
  profile_id uuid;
BEGIN
  -- Log início da execução
  RAISE LOG 'Iniciando criação de perfil para usuário %', NEW.id;
  
  -- Garantir que temos um ID válido
  IF NEW.id IS NULL THEN
    RAISE LOG 'ID do usuário é nulo';
    RETURN NEW;
  END IF;

  -- Verificar se já existe um perfil antes de tentar criar
  SELECT id INTO profile_id FROM public.profiles WHERE id = NEW.id;
  IF FOUND THEN
    RAISE LOG 'Perfil já existe para usuário %', NEW.id;
    RETURN NEW;
  END IF;

  -- Tentativas de criar o perfil
  WHILE current_try < max_retries AND NOT profile_created LOOP
    BEGIN
      current_try := current_try + 1;
      RAISE LOG 'Tentativa % de criar perfil para usuário %', current_try, NEW.id;

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
      -- Log detalhado do erro
      RAISE LOG 'Erro na tentativa % de criar perfil para usuário %: %', 
        current_try, NEW.id, SQLERRM;
      
      -- Esperar antes de tentar novamente (100ms, 200ms, 300ms)
      IF current_try < max_retries THEN
        PERFORM pg_sleep(current_try * 0.1);
      END IF;
    END;
  END LOOP;

  -- Se não conseguiu criar o perfil após todas as tentativas
  IF NOT profile_created THEN
    RAISE LOG 'Falha ao criar perfil para usuário % após % tentativas', NEW.id, max_retries;
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
  -- Atualizar perfis existentes que possam estar faltando dados
  UPDATE public.profiles p
  SET 
    email = u.email,
    name = COALESCE(p.name, split_part(u.email, '@', 1)),
    structure_name = COALESCE(p.structure_name, 'Estrutura Principal'),
    updated_at = NOW()
  FROM auth.users u
  WHERE p.id = u.id
  AND (p.email IS NULL OR p.name IS NULL OR p.structure_name IS NULL);

  -- Garantir que colunas obrigatórias não sejam nulas
  ALTER TABLE public.profiles 
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN structure_name SET NOT NULL;

END $$;