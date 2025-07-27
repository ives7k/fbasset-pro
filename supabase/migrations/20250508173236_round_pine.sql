/*
  # Corrigir criação automática de perfil

  1. Alterações
    - Recriar função handle_new_user com melhor tratamento de erros
    - Garantir que o perfil seja criado com todos os campos necessários
    - Adicionar validações para evitar duplicatas

  2. Segurança
    - Manter políticas RLS existentes
    - Garantir integridade dos dados
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Verificar se já existe um perfil para este usuário
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- Criar novo perfil com todos os campos necessários
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
    split_part(NEW.email, '@', 1),
    'Estrutura Principal',
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error details
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure email is not null in profiles
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL;