/*
  # Corrigir criação de perfil e permissões

  1. Alterações
    - Ajustar permissões da função handle_new_user
    - Garantir que o perfil seja criado com os dados corretos
    - Melhorar políticas de RLS
    - Adicionar índices para melhor performance

  2. Segurança
    - Garantir que apenas usuários autenticados possam acessar seus próprios dados
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
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Garantir que a função tenha as permissões necessárias
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Recriar trigger com prioridade alta
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Criar novas políticas mais específicas
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = id AND 
    email = auth.jwt()->>'email'
  );

CREATE POLICY "Enable select for users based on user_id"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (
      CASE 
        WHEN email IS NOT NULL THEN email = auth.jwt()->>'email'
        ELSE true
      END
    )
  );

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Garantir que colunas obrigatórias estão configuradas corretamente
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN structure_name SET NOT NULL;

-- Atualizar perfis existentes que possam estar faltando dados
UPDATE public.profiles p
SET 
  email = u.email,
  name = COALESCE(p.name, split_part(u.email, '@', 1)),
  structure_name = COALESCE(p.structure_name, 'Estrutura Principal'),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
AND (p.email IS NULL OR p.structure_name IS NULL);