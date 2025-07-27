/*
  # Corrigir configurações de segurança nas funções SQL

  1. Alterações
    - Adicionar SET search_path explicitamente para todas as funções
    - Remover funções existentes e recriar com configurações seguras
    - Atualizar políticas de RLS para maior segurança

  2. Segurança
    - Garantir que search_path está definido corretamente
    - Manter RLS habilitado
    - Manter políticas de acesso restritas
*/

-- Remover função e trigger existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função com configurações de segurança adequadas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  default_structure_name text := 'Estrutura Principal';
BEGIN
  -- Criar perfil imediatamente após a criação do usuário
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
    default_structure_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW()
  WHERE profiles.id = EXCLUDED.id;

  RETURN NEW;
END;
$$;

-- Configurar permissões da função
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Atualizar políticas de RLS
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Criar políticas mais seguras
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK ((auth.uid() = id) AND (email = (auth.jwt()->>'email')));

CREATE POLICY "Enable select for users based on user_id"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    (auth.uid() = id) AND
    CASE
      WHEN (email IS NOT NULL) THEN (email = (auth.jwt()->>'email'))
      ELSE true
    END
  );

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;