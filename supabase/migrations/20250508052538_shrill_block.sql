/*
  # Adicionar ativos iniciais necessários para anúncios

  1. Novos Ativos
    - Perfil do Facebook
    - Business Manager
    - Conta de Anúncio
    - Página do Facebook
    - Domínio
    - Hospedagem

  2. Objetivo
    - Garantir estrutura mínima para rodar anúncios no Facebook
*/

-- Função para inserir ativo se não existir
CREATE OR REPLACE FUNCTION insert_asset_if_not_exists(
  p_user_id uuid,
  p_name text,
  p_type text,
  p_status text DEFAULT 'pending'
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
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_name,
      p_type,
      p_status,
      0,
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para criar estrutura inicial para cada usuário
CREATE OR REPLACE FUNCTION create_initial_assets() RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Estrutura Principal
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Business Manager Principal',
      'bm'
    );
    
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Conta de Anúncio Principal',
      'conta_de_anuncio'
    );
    
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Domínio Principal',
      'dominio'
    );

    -- Estrutura do Facebook
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Perfil do Facebook',
      'perfil_do_facebook'
    );
    
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Página do Facebook',
      'pagina_do_facebook'
    );

    -- Estrutura de Hospedagem
    PERFORM insert_asset_if_not_exists(
      user_record.id,
      'Servidor Principal',
      'hospedagem'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Criar estrutura inicial para usuários existentes
SELECT create_initial_assets();

-- Trigger para criar estrutura inicial para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user_assets()
RETURNS trigger AS $$
BEGIN
  PERFORM insert_asset_if_not_exists(NEW.id, 'Business Manager Principal', 'bm');
  PERFORM insert_asset_if_not_exists(NEW.id, 'Conta de Anúncio Principal', 'conta_de_anuncio');
  PERFORM insert_asset_if_not_exists(NEW.id, 'Domínio Principal', 'dominio');
  PERFORM insert_asset_if_not_exists(NEW.id, 'Perfil do Facebook', 'perfil_do_facebook');
  PERFORM insert_asset_if_not_exists(NEW.id, 'Página do Facebook', 'pagina_do_facebook');
  PERFORM insert_asset_if_not_exists(NEW.id, 'Servidor Principal', 'hospedagem');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created_assets
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_assets();