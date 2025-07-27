/*
  # Atualizar tipos de ativos com segurança

  1. Alterações
    - Atualizar dados existentes para os novos tipos permitidos
    - Adicionar constraint para validar tipos
*/

-- Primeiro, atualizar registros existentes para um tipo válido
UPDATE assets SET type = 'outros' WHERE type NOT IN (
  'dominio',
  'hospedagem',
  'bm',
  'conta_de_anuncio',
  'perfil_do_facebook',
  'pagina_do_facebook',
  'pagina_do_instagram',
  'outros'
);

-- Remover constraint existente se houver
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'assets_type_check'
  ) THEN
    ALTER TABLE assets DROP CONSTRAINT assets_type_check;
  END IF;
END $$;

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
  'pagina_do_instagram',
  'outros'
));