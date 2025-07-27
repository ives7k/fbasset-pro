/*
  # Adicionar nome da estrutura

  1. Alterações
    - Adicionar coluna structure_name na tabela assets
    - Definir valor padrão como 'Estrutura Principal'
    - Atualizar registros existentes
*/

-- Adicionar coluna structure_name
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS structure_name text NOT NULL DEFAULT 'Estrutura Principal';

-- Atualizar registros existentes que não têm um nome de estrutura
UPDATE assets 
SET structure_name = 'Estrutura Principal' 
WHERE structure_name IS NULL;