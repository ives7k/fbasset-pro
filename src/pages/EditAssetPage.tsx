import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssets } from '../context/AssetContext';
import AssetForm from '../components/assets/AssetForm';
import { ChevronLeft } from 'lucide-react';

const EditAssetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { assets, updateAsset, deleteAsset } = useAssets();
  const navigate = useNavigate();
  
  const asset = assets.find(a => a.id === id);
  
  if (!asset) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">Ativo não encontrado</h2>
        <p className="text-gray-600 mt-2">O ativo que você está procurando não existe.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Voltar para Ativos
        </button>
      </div>
    );
  }
  
  const handleSubmit = (assetData: any) => {
    updateAsset({
      ...asset,
      ...assetData
    });
    navigate('/');
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.')) {
      deleteAsset(asset.id);
      navigate('/');
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar para Ativos
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Editar Ativo</h1>
          <p className="text-gray-600">Atualizar detalhes de {asset.name}</p>
        </div>
      </div>
      
      <AssetForm
        initialData={asset}
        onSubmit={handleSubmit}
        onCancel={handleDelete}
      />
    </div>
  );
};

export default EditAssetPage;