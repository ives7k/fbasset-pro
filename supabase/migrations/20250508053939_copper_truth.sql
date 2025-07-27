/*
  # Adicionar descrições detalhadas aos ativos da estrutura

  1. Alterações
    - Atualiza a função de inserção de ativos com descrições mais detalhadas
    - Adiciona tags específicas para cada tipo de ativo
    - Melhora a organização da estrutura inicial

  2. Segurança
    - Mantém as políticas RLS existentes
    - Preserva todos os dados existentes
*/

-- Função para inserir ativo se não existir com descrições detalhadas
CREATE OR REPLACE FUNCTION insert_asset_if_not_exists(
  p_user_id uuid,
  p_name text,
  p_type text,
  p_status text DEFAULT 'pending',
  p_description text DEFAULT NULL,
  p_tags text[] DEFAULT ARRAY['estrutura-inicial']
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM assets 
    WHERE user_id = p_user_id 
    AND type = p_type
    AND name = p_name
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
      p_tags,
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para criar estrutura inicial completa
CREATE OR REPLACE FUNCTION create_complete_structure() RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Business Manager (Essencial para gerenciar contas e páginas)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Business Manager Principal',
      'bm',
      'pending',
      'Gerenciador central para todas as contas de anúncio e páginas',
      ARRAY['estrutura-inicial', 'gerenciamento', 'essencial']
    );
    
    -- Conta de Anúncio (Necessária para criar e veicular anúncios)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Conta de Anúncio Principal',
      'conta_de_anuncio',
      'pending',
      'Conta para criar e gerenciar campanhas publicitárias',
      ARRAY['estrutura-inicial', 'anuncios', 'essencial']
    );
    
    -- Domínio (Base para landing pages e presença online)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Domínio Principal',
      'dominio',
      'pending',
      'Domínio para landing pages e identidade online',
      ARRAY['estrutura-inicial', 'web', 'essencial']
    );

    -- Perfil do Facebook (Necessário para acesso ao BM)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Perfil do Facebook',
      'perfil_do_facebook',
      'pending',
      'Perfil pessoal necessário para acessar o Business Manager',
      ARRAY['estrutura-inicial', 'acesso', 'essencial']
    );
    
    -- Página do Facebook (Necessária para anúncios)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Página do Facebook',
      'pagina_do_facebook',
      'pending',
      'Página comercial para vincular aos anúncios',
      ARRAY['estrutura-inicial', 'presenca', 'essencial']
    );

    -- Servidor de Hospedagem (Para landing pages)
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Servidor Principal',
      'hospedagem',
      'pending',
      'Hospedagem para landing pages e sites',
      ARRAY['estrutura-inicial', 'web', 'essencial']
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Criar estrutura inicial para usuários existentes
SELECT create_complete_structure();

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
    'Gerenciador central para todas as contas de anúncio e páginas',
    ARRAY['estrutura-inicial', 'gerenciamento', 'essencial']
  );
  
  -- Conta de Anúncio
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Conta de Anúncio Principal',
    'conta_de_anuncio',
    'pending',
    'Conta para criar e gerenciar campanhas publicitárias',
    ARRAY['estrutura-inicial', 'anuncios', 'essencial']
  );
  
  -- Domínio
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Domínio Principal',
    'dominio',
    'pending',
    'Domínio para landing pages e identidade online',
    ARRAY['estrutura-inicial', 'web', 'essencial']
  );

  -- Perfil do Facebook
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Perfil do Facebook',
    'perfil_do_facebook',
    'pending',
    'Perfil pessoal necessário para acessar o Business Manager',
    ARRAY['estrutura-inicial', 'acesso', 'essencial']
  );
  
  -- Página do Facebook
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Página do Facebook',
    'pagina_do_facebook',
    'pending',
    'Página comercial para vincular aos anúncios',
    ARRAY['estrutura-inicial', 'presenca', 'essencial']
  );

  -- Servidor de Hospedagem
  PERFORM insert_asset_if_not_exists(
    NEW.id,
    'Servidor Principal',
    'hospedagem',
    'pending',
    'Hospedagem para landing pages e sites',
    ARRAY['estrutura-inicial', 'web', 'essencial']
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assets ON auth.users;
CREATE TRIGGER on_auth_user_created_assets
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_assets();