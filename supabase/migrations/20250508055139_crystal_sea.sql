/*
  # Atualizar status 'active' para 'online'

  1. Alterações
    - Atualizar registros existentes de 'active' para 'online'
    - Atualizar funções que criam ativos iniciais
*/

-- Atualizar registros existentes
UPDATE assets SET status = 'online' WHERE status = 'active';

-- Atualizar função de criação de ativos iniciais
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