/*
  # Corrigir criação de perfil e permissões

  1. Alterações
    - Recriar função handle_new_user com melhor tratamento de erros
    - Garantir que o perfil seja criado com todos os campos necessários
    - Simplificar políticas RLS
    - Adicionar logs para debug

  2. Segurança
    - Manter RLS habilitado
    - Garantir permissões corretas
*/

-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar função com permissões adequadas
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
      
      RAISE LOG 'Perfil criado com sucesso para usuário %', NEW.id;
    EXCEPTION WHEN others THEN
      -- Log detalhes do erro
      RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
      -- Tentar novamente após um breve delay
      PERFORM pg_sleep(0.5);
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
        
        RAISE LOG 'Perfil criado com sucesso na segunda tentativa para usuário %', NEW.id;
      EXCEPTION WHEN others THEN
        RAISE LOG 'Falha na segunda tentativa de criar perfil para usuário %: %', NEW.id, SQLERRM;
      END;
    END;
  ELSE
    RAISE LOG 'Perfil já existe para usuário %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Garantir que a função tenha as permissões necessárias
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso ao próprio perfil" ON profiles;

-- Criar política simplificada
CREATE POLICY "Permitir acesso ao próprio perfil"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;