/*
  # Corrigir problemas de segurança

  1. Alterações
    - Definir search_path explicitamente para todas as funções
    - Melhorar tratamento de erros
    - Simplificar políticas de RLS
*/

-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recriar tabela profiles com configurações seguras
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text,
  avatar_url text,
  structure_name text NOT NULL DEFAULT 'Estrutura Principal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política única e simplificada
CREATE POLICY "Permitir acesso ao próprio perfil"
  ON profiles
  USING (auth.uid() = id);

-- Função para criar perfil automaticamente com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  default_structure_name text := 'Estrutura Principal';
BEGIN
  -- Criar perfil com validações
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
  );

  RETURN NEW;
EXCEPTION 
  WHEN unique_violation THEN
    -- Ignorar se o perfil já existe
    RETURN NEW;
  WHEN others THEN
    -- Logar erro mas permitir que a criação do usuário continue
    RAISE LOG 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Configurar permissões da função
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();