/*
  # Corrigir criação automática de perfil

  1. Alterações
    - Recriar função handle_new_user com melhor tratamento de erros
    - Ajustar permissões e políticas de RLS
    - Garantir que o perfil seja criado corretamente

  2. Segurança
    - Manter RLS habilitado
    - Configurar permissões adequadas
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
BEGIN
  -- Criar perfil com retry em caso de erro
  FOR i IN 1..3 LOOP
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
      
      -- Se chegou aqui, inserção foi bem sucedida
      RETURN NEW;
    EXCEPTION 
      WHEN unique_violation THEN
        -- Perfil já existe, podemos retornar
        RETURN NEW;
      WHEN others THEN
        -- Em caso de outro erro, tentar novamente se não for a última tentativa
        IF i < 3 THEN
          PERFORM pg_sleep(0.1 * i); -- Esperar um pouco antes de tentar novamente
          CONTINUE;
        END IF;
        -- Na última tentativa, logar o erro
        RAISE LOG 'Erro ao criar perfil na tentativa %: %', i, SQLERRM;
    END;
  END LOOP;

  -- Se chegou aqui, todas as tentativas falharam
  RETURN NEW;
END;
$$;

-- Garantir que a função tenha as permissões necessárias
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Recriar trigger com prioridade alta
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que as políticas estão corretas
DROP POLICY IF EXISTS "Permitir acesso ao próprio perfil" ON profiles;

CREATE POLICY "Permitir acesso ao próprio perfil"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;