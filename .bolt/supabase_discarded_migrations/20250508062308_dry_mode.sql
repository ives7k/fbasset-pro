/*
  # Atualizar status 'active' para 'online'

  1. Alterações
    - Atualizar registros existentes de 'active' para 'online'
    - Atualizar constraint de status para usar 'online'
*/

-- Atualizar registros existentes
UPDATE assets SET status = 'online' WHERE status = 'active';

-- Remover constraint existente
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- Adicionar nova constraint com status atualizados
ALTER TABLE assets
ADD CONSTRAINT assets_status_check
CHECK (status IN ('online', 'expired', 'pending', 'inactive'));