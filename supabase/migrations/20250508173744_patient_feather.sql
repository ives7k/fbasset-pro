/*
  # Corrigir políticas de segurança e criação de perfil

  1. Alterações
    - Ajustar políticas RLS para profiles
    - Melhorar função de criação de perfil
    - Adicionar políticas para inserção de perfil
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Criar políticas mais permissivas para criação inicial
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

-- Melhorar função de criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  current_try int := 0;
  profile_created boolean := false;
BEGIN
  -- Log início da execução
  RAISE LOG 'Iniciando criação de perfil para usuário %', NEW.id;

  -- Verificar se já existe um perfil
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE LOG 'Perfil já existe para usuário %', NEW.id;
    RETURN NEW;
  END IF;

  -- Tentativas de criar o perfil
  WHILE current_try < max_retries AND NOT profile_created LOOP
    BEGIN
      current_try := current_try + 1;
      
      -- Criar perfil com permissões do sistema
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

      profile_created := true;
      RAISE LOG 'Perfil criado com sucesso para usuário %', NEW.id;

    EXCEPTION WHEN others THEN
      RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
      IF current_try < max_retries THEN
        PERFORM pg_sleep(current_try * 0.1);
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;