/*
  # Simplificar estrutura e corrigir criação de perfil

  1. Alterações
    - Remover todas as funções e triggers existentes
    - Recriar tabelas com estrutura mínima
    - Simplificar políticas de RLS
    - Criar nova função de perfil mais robusta
*/

-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;

-- Criar tabela profiles com estrutura mínima
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text
);

-- Criar tabela assets
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cost numeric(10,2) DEFAULT 0 NOT NULL,
  expiration_date timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT assets_type_check CHECK (type IN (
    'dominio', 'hospedagem', 'bm', 'conta_de_anuncio',
    'perfil_do_facebook', 'pagina_do_facebook', 'perfil_do_instagram', 'outros'
  )),
  CONSTRAINT assets_status_check CHECK (status IN (
    'online', 'expired', 'pending', 'inactive'
  ))
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Criar políticas simplificadas
CREATE POLICY "Permitir acesso ao próprio perfil"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Permitir acesso aos próprios assets"
  ON assets FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Criar função simplificada para perfil
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil com retry em caso de erro
  FOR i IN 1..3 LOOP
    BEGIN
      INSERT INTO profiles (id, email, name)
      VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
      EXIT; -- Sair do loop se inserção foi bem sucedida
    EXCEPTION 
      WHEN unique_violation THEN
        RETURN NEW; -- Perfil já existe
      WHEN others THEN
        IF i = 3 THEN
          RAISE LOG 'Erro ao criar perfil após 3 tentativas: %', SQLERRM;
        ELSE
          PERFORM pg_sleep(0.1 * i);
          CONTINUE;
        END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();