/*
  # Adicionar nome da estrutura ao perfil

  1. Alterações
    - Adicionar coluna structure_name na tabela profiles
    - Definir valor padrão como 'Estrutura Principal'
    - Atualizar registros existentes
*/

-- Adicionar coluna structure_name
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS structure_name text NOT NULL DEFAULT 'Estrutura Principal';

-- Atualizar registros existentes que não têm um nome de estrutura
UPDATE profiles 
SET structure_name = 'Estrutura Principal' 
WHERE structure_name IS NULL;