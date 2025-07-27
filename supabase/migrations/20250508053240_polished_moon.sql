/*
  # Adicionar ativos necessários para estrutura completa

  1. Alterações
    - Criar função para inserir ativos se não existirem
    - Criar função para gerar estrutura inicial
    - Adicionar trigger para novos usuários
    - Criar estrutura para usuários existentes

  2. Ativos Criados
    - Business Manager
    - Conta de Anúncio
    - Domínio
    - Perfil do Facebook
    - Página do Facebook
    - Servidor de Hospedagem
*/

-- Função para inserir ativo se não existir
CREATE OR REPLACE FUNCTION insert_asset_if_not_exists(
  p_user_id uuid,
  p_name text,
  p_type text,
  p_status text DEFAULT 'pending',
  p_description text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM assets 
    WHERE user_id = p_user_id 
    AND type = p_type
  ) THEN
    INSERT INTO assets (
      user_id,
      name,
      type,
      status,
      cost,
      tags,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_name,
      p_type,
      p_status,
      0,
      ARRAY['estrutura-inicial'],
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para criar estrutura inicial para cada usuário
CREATE OR REPLACE FUNCTION create_initial_structure() RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Business Manager
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Business Manager Principal',
      'bm',
      'pending',
      'BM principal para gerenciamento de anúncios'
    );
    
    -- Conta de Anúncio
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Conta de Anúncio Principal',
      'conta_de_anuncio',
      'pending',
      'Conta principal para veiculação de anúncios'
    );
    
    -- Domínio
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Domínio Principal',
      'dominio',
      'pending',
      'Domínio principal para landing pages'
    );

    -- Perfil do Facebook
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Perfil do Facebook',
      'perfil_do_facebook',
      'pending',
      'Perfil pessoal para gerenciamento'
    );
    
    -- Página do Facebook
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Página do Facebook',
      'pagina_do_facebook',
      'pending',
      'Página comercial para anúncios'
    );

    -- Servidor de Hospedagem
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Servidor Principal',
      'hospedagem',
      'pending',
      'Servidor para hospedagem de landing pages'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Criar estrutura inicial para usuários existentes
SELECT create_initial_structure();

-- Trigger para criar estrutura inicial para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user_assets()
RETURNS trigger AS $$
BEGIN
  -- Business Manager
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Business Manager Principal',
    'bm',
    'pending',
    'BM principal para gerenciamento de anúncios'
  );
  
  -- Conta de Anúncio
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Conta de Anúncio Principal',
    'conta_de_anuncio',
    'pending',
    'Conta principal para veiculação de anúncios'
  );
  
  -- Domínio
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Domínio Principal',
    'dominio',
    'pending',
    'Domínio principal para landing pages'
  );

  -- Perfil do Facebook
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Perfil do Facebook',
    'perfil_do_facebook',
    'pending',
    'Perfil pessoal para gerenciamento'
  );
  
  -- Página do Facebook
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Página do Facebook',
    'pagina_do_facebook',
    'pending',
    'Página comercial para anúncios'
  );

  -- Servidor de Hospedagem
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Servidor Principal',
    'hospedagem',
    'pending',
    'Servidor para hospedagem de landing pages'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created_assets'
  ) THEN
    CREATE TRIGGER on_auth_user_created_assets
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user_assets();
  END IF;
END $$;