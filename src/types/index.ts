export type AssetType = 
  | 'dominio'
  | 'hospedagem'
  | 'bm'
  | 'conta_de_anuncio'
  | 'perfil_do_facebook'
  | 'pagina_do_facebook'
  | 'perfil_do_instagram'
  | 'outros';

export type AssetStatus = 'online' | 'expired' | 'pending' | 'inactive';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  cost: number;
  expirationDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  structure_name: string;
}