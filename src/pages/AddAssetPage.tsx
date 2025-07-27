import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAssets } from '../context/AssetContext';
import AssetForm from '../components/assets/AssetForm';
import { ChevronLeft, Plus } from 'lucide-react';
import { AssetType } from '../types';

interface LocationState {
  selectedType?: AssetType;
}

const AddAssetPage: React.FC = () => {
  const { addAsset } = useAssets();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedType } = (location.state as LocationState) || {};
  
  const handleSubmit = (assetData: any) => {
    addAsset(assetData);
    navigate('/');
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={handleCancel}
            className="flex items-center text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar para Ativos
          </button>
          
          <h1 className="text-2xl font-bold text-white mb-1">
            Adicionar Novo Ativo
          </h1>
          <p className="text-zinc-400">Adicione um novo ativo digital ao seu portfólio</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-[#0B1120]/50 text-indigo-400 rounded-lg border border-indigo-500/10">
          <Plus className="h-5 w-5 mr-2" />
          <span>Novo Ativo</span>
        </div>
      </div>
      
      <AssetForm
        initialData={{ type: selectedType }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddAssetPage;