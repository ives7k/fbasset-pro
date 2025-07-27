import React from 'react';
import { Building2, Loader2, Facebook, CreditCard, Wallet, CheckCircle, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../context/AssetContext';
import { useAuth } from '../context/AuthContext';
import StatusIndicator from '../components/ui/StatusIndicator';
import { Asset, AssetType } from '../types';

interface StructureStatus {
  isReady: boolean;
  missing: string[];
  total: number;
  active: number;
}

interface StructureCard {
  title: string;
  icon: React.ReactNode;
  items: { name: string; value: string; status?: 'active' | 'pending' | 'expired' }[];
}

const HomePage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { assets, loading, fetchAssets } = useAssets();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [structureName, setStructureName] = React.useState(profile?.structure_name || 'Estrutura Principal');
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAssets();
    setIsRefreshing(false);
  };
  
  const handleStartEditing = () => {
    setIsEditing(true);
    // Foca no input após renderizar
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  
  const handleFinishEditing = () => {
    updateProfile({ structure_name: structureName });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
    }
    if (e.key === 'Escape') {
      handleFinishEditing();
    }
  };
  
  React.useEffect(() => {
    if (profile?.structure_name) {
      setStructureName(profile.structure_name);
    }
  }, [profile?.structure_name]);
  // Verificar status da estrutura
  const checkStructureStatus = (): StructureStatus => {
    const requiredAssets = {
      'perfil_do_facebook': 'Perfil do Facebook',
      'bm': 'Business Manager',
      'conta_de_anuncio': 'Conta de Anúncio',
      'pagina_do_facebook': 'Página do Facebook',
      'dominio': 'Domínio',
      'hospedagem': 'Hospedagem'
    };

    const missing = [];
    let activeCount = 0;
    
    for (const [type, name] of Object.entries(requiredAssets)) {
      const hasActiveAsset = assets.some(a => a.type === type && a.status === 'online');
      if (!hasActiveAsset) {
        missing.push(name);
      } else {
        activeCount++;
      }
    }

    return {
      isReady: missing.length === 0,
      missing,
      total: Object.keys(requiredAssets).length,
      active: activeCount
    };
  };

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<AssetType, Asset[]>);

  // Lista de tipos de ativos essenciais
  const essentialAssets = ['bm', 'conta_de_anuncio', 'dominio', 'perfil_do_facebook', 'pagina_do_facebook', 'hospedagem'];

  const structures: StructureCard[] = [
    {
      title: 'Estrutura Principal',
      icon: <Building2 className="h-5 w-5 text-zinc-400" />,
      items: [
        { 
          name: 'Business Manager', 
          value: `${groupedAssets.bm?.length || 0} ativos`,
          status: groupedAssets.bm?.some(a => a.status === 'active') ? 'active' : 'pending'
        },
        { 
          name: 'Contas de Anúncio', 
          value: `${groupedAssets.conta_de_anuncio?.length || 0} ativos`,
          status: groupedAssets.conta_de_anuncio?.some(a => a.status === 'active') ? 'active' : 'pending'
        },
        { 
          name: 'Domínios', 
          value: `${groupedAssets.dominio?.length || 0} ativos`,
          status: groupedAssets.dominio?.some(a => a.status === 'active') ? 'active' : 'pending'
        }
      ]
    },
    {
      title: 'Estrutura do Facebook',
      icon: <Facebook className="h-5 w-5 text-zinc-400" />,
      items: [
        { 
          name: 'Páginas', 
          value: `${groupedAssets.pagina_do_facebook?.length || 0} ativos` 
        },
        { 
          name: 'Perfis', 
          value: `${groupedAssets.perfil_do_facebook?.length || 0} ativos` 
        }
      ]
    },
    {
      title: 'Estrutura de Hospedagem',
      icon: <CreditCard className="h-5 w-5 text-zinc-400" />,
      items: [
        { 
          name: 'Servidores', 
          value: `${groupedAssets.hospedagem?.length || 0} ativos` 
        }
      ]
    },
    {
      title: 'Estrutura de Pagamentos',
      icon: <Wallet className="h-5 w-5 text-zinc-400" />,
      items: [
        {
          name: 'Cartões Vinculados',
          value: '2 ativos'
        },
        {
          name: 'Faturas Pendentes',
          value: 'R$ 1.500,00'
        },
        {
          name: 'Próximo Vencimento',
          value: '15/05/2025'
        }
      ]
    }
  ];

  const structureStatus = checkStructureStatus();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
        <p className="text-gray-400">Visualize a estrutura completa dos seus ativos</p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-4" />
          <p className="text-zinc-400">Carregando ativos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl border border-indigo-500/10 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Ativos Online</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-emerald-400">
                {assets.filter(a => a.status === 'online').length}
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">
                ativos funcionando normalmente
              </p>
            </div>
            
            <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl border border-indigo-500/10 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Pendentes</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-amber-400">
                {assets.filter(a => a.status === 'pending').length}
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">
                ativos aguardando ativação
              </p>
            </div>
            
            <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl border border-indigo-500/10 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Expirados</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-red-400">
                {assets.filter(a => a.status === 'expired').length}
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">
                ativos que precisam de atenção
              </p>
            </div>
            
            <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl border border-indigo-500/10 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-500/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Custo Total</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-zinc-100">
                R$ {assets.reduce((total, asset) => total + asset.cost, 0).toFixed(2)}
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-400 mt-1">
                investimento em ativos
              </p>
            </div>
          </div>

          <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl border border-indigo-500/10 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
              <div className="p-2 bg-[#0B1120]/80 rounded-lg border border-indigo-500/10">
                <Building2 className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={structureName}
                    onChange={(e) => setStructureName(e.target.value)}
                    onBlur={handleFinishEditing}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-lg font-semibold text-white w-full focus:outline-none border-b border-zinc-700 pb-0.5"
                    maxLength={50}
                  />
                ) : (
                  <h2 
                    className="text-lg font-semibold text-white cursor-pointer hover:text-zinc-300 transition-colors truncate"
                    onClick={handleStartEditing}
                    title="Clique para editar o nome"
                  >
                    {structureName}
                  </h2>
                )}
                {structureStatus.active === 0 ? (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-2">
                    Estrutura não iniciada
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Atualizar status"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </p>
                ) : structureStatus.isReady ? (
                  <p className="text-emerald-400 text-sm mt-1 flex items-center gap-2">
                    Estrutura pronta para anúncios
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Atualizar status"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </p>
                ) : (
                  <p className="text-amber-400 text-sm mt-1 flex items-center gap-2">
                    Faltam {structureStatus.missing.length} itens para completar
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Atualizar status"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 md:mt-0 w-full md:w-auto">
                {structureStatus.active === 0 ? (
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                ) : structureStatus.isReady ? (
                  <div className="p-2 bg-emerald-500/10 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                )}
                <div className="flex items-center gap-2 flex-1 md:w-32">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        structureStatus.active === 0 ? 'bg-red-500' :
                        structureStatus.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(structureStatus.active / structureStatus.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-400">
                    {Math.round((structureStatus.active / structureStatus.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {essentialAssets.map((type) => {
                const assetsOfType = groupedAssets[type] || [];
                const hasActiveAsset = assetsOfType.some(a => a.status === 'online');
                
                return (
                  <div
                    key={type}
                    onClick={() => navigate('/assets', { state: { selectedType: type } })}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120]/80 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all duration-300"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-zinc-300">
                      {type === 'bm' ? 'Business Manager' :
                       type === 'conta_de_anuncio' ? 'Contas de Anúncio' :
                       type === 'dominio' ? 'Domínios' :
                       type === 'perfil_do_facebook' ? 'Perfil do Facebook' :
                       type === 'pagina_do_facebook' ? 'Página do Facebook' :
                       type === 'hospedagem' ? 'Hospedagem' : type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {assetsOfType.length} {assetsOfType.length === 1 ? 'ativo' : 'ativos'}
                      </span>
                      <StatusIndicator status={hasActiveAsset ? 'online' : 'pending'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;