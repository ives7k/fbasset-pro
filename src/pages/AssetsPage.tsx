import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import AssetCard from '../components/assets/AssetCard';
import AssetFolder from '../components/assets/AssetFolder';
import StatusBadge from '../components/ui/StatusBadge';
import { Asset, AssetType, AssetStatus } from '../types';

const ALL_STATUSES: AssetStatus[] = [
  'online',
  'expired',
  'pending',
  'inactive'
];

const ALL_ASSET_TYPES: AssetType[] = [
  'dominio',
  'hospedagem',
  'bm',
  'conta_de_anuncio',
  'perfil_do_facebook',
  'pagina_do_facebook',
  'perfil_do_instagram',
  'outros'
];

const AssetsPage: React.FC = () => {
  const { assets, loading, error } = useAssets();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<AssetType | null>(
    location.state?.selectedType || null
  );
  
  // Memoize filtered assets to prevent unnecessary recalculations
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedFolder ? asset.type === selectedFolder : true;
    
    return matchesSearch && matchesType;
  }), [assets, searchTerm, selectedFolder]);
  
  // Group assets by type
  const assetsByType = useMemo(() => {
    // Inicializar com todos os tipos possíveis
    const initialGroups = ALL_ASSET_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<AssetType, Asset[]>);

    // Adicionar os ativos existentes
    return assets.reduce((acc, asset) => {
      if (acc[asset.type]) {
        acc[asset.type].push(asset);
      }
      return acc;
    }, initialGroups);
  }, [assets]);
  
  const handleEditAsset = (id: string) => {
    navigate(`/edit-asset/${id}`);
  };
  
  const handleAddAsset = () => {
    navigate('/add-asset', { state: { selectedType: selectedFolder } });
  };

  const handleFolderClick = (type: AssetType) => {
    setSelectedFolder(type);
  };
  
  const handleBackClick = () => {
    setSelectedFolder(null);
  };
  
  // Memoize status counts
  const statusCounts = useMemo(() => assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [assets]);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ativos Digitais</h1>
          <p className="text-gray-400">Gerencie seu portfólio de ativos digitais</p>
        </div>
        
        <button
          onClick={handleAddAsset}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-[#0B1120]/50 text-indigo-400 rounded-lg border border-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Novo Ativo
        </button>
      </div>
      
      <div className="bg-zinc-950/50 backdrop-blur-sm rounded-lg border border-zinc-800 p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 placeholder-zinc-500"
            placeholder="Buscar ativos por nome ou etiquetas..."
          />
        </div>
      </div>
      
      {/* Status summary */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div
          className={`bg-[#0B1120]/50 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
            'border-indigo-500/10 hover:border-indigo-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Total</span>
            <span className="text-sm font-semibold text-white">{assets.length}</span>
          </div>
        </div>
        
        {ALL_STATUSES.map((status) => (
          <div
            key={status}
            className={`bg-[#0B1120]/50 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
              'border-indigo-500/10 hover:border-indigo-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-sm font-semibold text-white">{statusCounts[status] || 0}</span>
            </div>
          </div>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-zinc-400">Carregando ativos...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-950/50 backdrop-blur-sm rounded-lg border border-red-500/10">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      ) : (
        filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {selectedFolder ? (
                <div key="assets" className="col-span-full transition-all duration-200">
                  <div className="mb-6">
                    <button
                      onClick={handleBackClick}
                      className="flex items-center text-zinc-400 hover:text-white hover:-translate-x-1 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar para Pastas
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAssets.map((asset, index) => (
                      <div
                        key={asset.id}
                        className="transition-all duration-200"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeIn 0.2s ease-out forwards'
                        }}
                      >
                        <AssetCard
                          asset={asset}
                          onEdit={handleEditAsset}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  key="folders"
                  className="col-span-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                >
                  {Object.entries(assetsByType).map(([type, typeAssets], index) => (
                    <div
                      key={type}
                      className="transition-all duration-200"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeIn 0.2s ease-out forwards'
                      }}
                    >
                      <AssetFolder
                        type={type as AssetType}
                        assets={typeAssets}
                        onClick={() => handleFolderClick(type as AssetType)}
                      />
                    </div>
                  ))}
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0B1120]/50 backdrop-blur-sm rounded-lg border border-indigo-500/10">
            <p className="text-gray-400 text-lg">Nenhum ativo encontrado com os filtros selecionados.</p>
            <button
              onClick={handleAddAsset}
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/30 hover:border-indigo-500/30 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Novo Ativo
            </button>
          </div>
        )
      )}
    </div>
  )
}

// Adiciona a animação de fadeIn ao CSS global
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

export default AssetsPage;