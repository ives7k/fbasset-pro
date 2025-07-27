/*
  # Configuração inicial do banco de dados

  1. Tabelas
    - `profiles`: Perfis de usuário
      - `id` (uuid, chave primária)
      - `email` (text, único)
      - `name` (text)
      - `avatar_url` (text)
      - `structure_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `assets`: Ativos digitais
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência a auth.users)
      - `name` (text)
      - `type` (text)
      - `status` (text)
      - `cost` (numeric)
      - `expiration_date` (timestamp)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `structure_name` (text)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas no usuário autenticado
    - Trigger para criação automática de perfil
*/

-- Remover tabelas existentes se houver
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover funções e triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar tabela de perfis
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  structure_name text NOT NULL DEFAULT 'Estrutura Principal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de ativos
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  expiration_date timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  structure_name text NOT NULL DEFAULT 'Estrutura Principal',
  CONSTRAINT assets_type_check CHECK (
    type IN (
      'dominio',
      'hospedagem',
      'bm',
      'conta_de_anuncio',
      'perfil_do_facebook',
      'pagina_do_facebook',
      'perfil_do_instagram',
      'outros'
    )
  ),
  CONSTRAINT assets_status_check CHECK (
    status IN (
      'online',
      'expired',
      'pending',
      'inactive'
    )
  )
);

-- Criar índices
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_created_at ON public.assets(created_at DESC);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Criar políticas para profiles
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

-- Criar políticas para assets
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

-- Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
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

-- Criar trigger para criação automática de perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();