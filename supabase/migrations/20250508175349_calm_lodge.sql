/*
  # Ajustar segurança na criação de usuário

  1. Alterações
    - Ajustar permissões da função handle_new_user
    - Garantir que a função tenha acesso adequado às tabelas
    - Melhorar tratamento de erros
*/

-- Remover função e trigger existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função com permissões adequadas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log erro mas permite que a criação do usuário continue
  RAISE LOG 'Erro ao criar perfil: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Garantir que a função tenha as permissões necessárias
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que as políticas de RLS estão corretas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir que as colunas obrigatórias estão configuradas corretamente
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN structure_name SET NOT NULL;