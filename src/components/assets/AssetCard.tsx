import React, { memo } from 'react';
import { Asset } from '../../types';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, getExpirationStatus, getAssetTypeDisplay, getAssetTypeColor } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';
import TagBadge from '../ui/TagBadge';
import AssetDetailsModal from './AssetDetailsModal';

interface AssetCardProps {
  asset: Asset;
  onEdit: (id: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = memo(({ asset, onEdit }) => {
  const expirationStatus = getExpirationStatus(asset.expirationDate);
  const [showDetails, setShowDetails] = React.useState(false);
  
  return (
    <>
      <div
        className="bg-[#0B1120]/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:bg-indigo-500/10 cursor-pointer flex flex-col border border-indigo-500/10"
        onClick={() => setShowDetails(true)}
      >
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-white truncate flex-1 mr-3">{asset.name}</h3>
            <StatusBadge status={asset.status} />
          </div>
          
          <div className={`text-sm font-medium ${getAssetTypeColor(asset.type)} mb-4`}>
            {getAssetTypeDisplay(asset.type)}
          </div>
          
          <div className="space-y-3">
            {asset.expirationDate && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-zinc-400 mr-2" />
                <span className="mr-2 text-zinc-300">{formatDate(asset.expirationDate)}</span>
                <span className={`text-xs ${expirationStatus.className}`}>
                  {expirationStatus.text}
                </span>
              </div>
            )}
            
            {asset.updatedAt !== asset.createdAt && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-zinc-400 mr-2" />
                <span className="text-zinc-300">Atualizado em: {formatDate(asset.updatedAt)}</span>
              </div>
            )}
          </div>
          
          {asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4 mb-2">
              {asset.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-[#0B1120]/80 px-5 py-3 border-t border-indigo-500/10 mt-auto">
          <button
            onClick={() => onEdit(asset.id)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-all font-semibold flex items-center group w-full"
          >
            Editar Ativo
          </button>
        </div>
      </div>
      
      {showDetails && (
        <AssetDetailsModal
          asset={asset}
          onClose={() => setShowDetails(false)}
          onEdit={onEdit}
        />
      )}
    </>
  );
});

export default AssetCard;