/*
  # Corrigir constraint de status

  1. Alterações
    - Remove constraint existente de status
    - Atualiza todos os status inválidos para valores permitidos
    - Adiciona nova constraint com status permitidos
*/

-- Primeiro atualiza todos os status para valores válidos
UPDATE assets SET status = 'inactive' WHERE status NOT IN ('online', 'expired', 'pending', 'inactive');

-- Remove todas as constraints relacionadas a status
DO $$ 
BEGIN
  -- Remove a constraint de status se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'assets_status_check'
    AND table_name = 'assets'
  ) THEN
    ALTER TABLE assets DROP CONSTRAINT assets_status_check;
  END IF;
END $$;

-- Atualiza os registros de 'active' para 'online'
UPDATE assets SET status = 'online' WHERE status = 'active';

-- Adiciona a nova constraint
ALTER TABLE assets
ADD CONSTRAINT assets_status_check
CHECK (status IN ('online', 'expired', 'pending', 'inactive'));