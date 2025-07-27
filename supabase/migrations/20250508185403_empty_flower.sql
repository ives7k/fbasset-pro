-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Criar tabela profiles da forma mais simples possível
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text,
  structure_name text NOT NULL DEFAULT 'Estrutura Principal',
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política simples
CREATE POLICY "Permitir acesso ao próprio perfil"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Criar função básica
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();