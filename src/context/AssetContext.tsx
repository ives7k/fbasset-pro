import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset } from '../types';
import { getStoredAssets, setStoredAssets } from '../lib/storage';
import { useAuth } from './AuthContext';
import { useMemo } from 'react';

interface AssetContextType {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  fetchAssets: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const VALID_ASSET_TYPES = [
  'dominio',
  'hospedagem',
  'bm',
  'conta_de_anuncio',
  'perfil_do_facebook',
  'pagina_do_facebook',
  'pagina_do_instagram',
  'outros'
] as const;

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(getStoredAssets());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const storedAssets = getStoredAssets();
      setAssets(storedAssets.filter(asset => asset.user_id === user?.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao buscar ativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
    } else {
      setAssets([]);
      setLoading(false);
    }
  }, [user]);

  const addAsset = async (newAssetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('Usuário deve estar logado para adicionar ativos');
      
      if (!VALID_ASSET_TYPES.includes(newAssetData.type as any)) {
        throw new Error(`Tipo de ativo inválido. Tipos permitidos: ${VALID_ASSET_TYPES.join(', ')}`);
      }

      const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        ...newAssetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedAssets = [...assets, newAsset];
      setAssets(updatedAssets);
      setStoredAssets(updatedAssets);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao adicionar ativo');
      throw error;
    }
  };

  const updateAsset = async (updatedAsset: Asset) => {
    try {
      if (!user) throw new Error('Usuário deve estar logado para atualizar ativos');

      if (!VALID_ASSET_TYPES.includes(updatedAsset.type as any)) {
        throw new Error(`Tipo de ativo inválido. Tipos permitidos: ${VALID_ASSET_TYPES.join(', ')}`);
      }

      const updatedAssets = assets.map(asset =>
        asset.id === updatedAsset.id
          ? { ...updatedAsset, updatedAt: new Date().toISOString() }
          : asset
      );
      
      setAssets(updatedAssets);
      setStoredAssets(updatedAssets);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar ativo');
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      if (!user) throw new Error('Usuário deve estar logado para excluir ativos');
      
      const updatedAssets = assets.filter(asset => asset.id !== id);
      setAssets(updatedAssets);
      setStoredAssets(updatedAssets);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir ativo');
      throw error;
    }
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset, updateAsset, deleteAsset, fetchAssets, loading, error }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = (): AssetContextType => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};