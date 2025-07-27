/*
  # Atualizar tipo de ativo do Instagram

  1. Alterações
    - Remover constraint existente
    - Atualizar registros de 'pagina_do_instagram' para 'perfil_do_instagram'
    - Adicionar nova constraint com tipos atualizados
*/

-- Remover constraint existente primeiro
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;

-- Atualizar registros existentes
UPDATE assets 
SET type = 'perfil_do_instagram' 
WHERE type = 'pagina_do_instagram';

-- Adicionar nova constraint com os tipos atualizados
ALTER TABLE assets
ADD CONSTRAINT assets_type_check
CHECK (type IN (
  'dominio',
  'hospedagem',
  'bm',
  'conta_de_anuncio',
  'perfil_do_facebook',
  'pagina_do_facebook',
  'perfil_do_instagram',
  'outros'
));