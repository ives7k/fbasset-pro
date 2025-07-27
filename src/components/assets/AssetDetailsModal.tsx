import React, { memo } from 'react';
import { X, Calendar, Clock, DollarSign } from 'lucide-react';
import { Asset } from '../../types';
import { formatDate, formatCurrency, getExpirationStatus, getAssetTypeDisplay, getAssetTypeColor } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';
import TagBadge from '../ui/TagBadge';

interface AssetDetailsModalProps {
  asset: Asset;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = memo(({ asset, onClose, onEdit }) => {
  const expirationStatus = getExpirationStatus(asset.expirationDate);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120]/90 border border-indigo-500/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{asset.name}</h2>
              <div className="flex items-center gap-3">
                <StatusBadge status={asset.status} />
                <span className={`text-sm font-medium ${getAssetTypeColor(asset.type)}`}>
                  {getAssetTypeDisplay(asset.type)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 border-t border-indigo-500/20 pt-6">
            {/* Custo */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Custo</h3>
              <div className="flex items-center text-xl font-semibold text-white">
                <span className="text-emerald-500">R$ {formatCurrency(asset.cost)}</span>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {asset.expirationDate && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Data de Expiração</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-zinc-500" />
                    <span className="text-white">{formatDate(asset.expirationDate)}</span>
                    <span className={`text-sm ${expirationStatus.className}`}>
                      ({expirationStatus.text})
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Criado em</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-zinc-500" />
                  <span className="text-white">{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-indigo-500/20 p-6">
          <button
            onClick={() => onEdit(asset.id)}
            className="w-full bg-indigo-500/20 text-indigo-400 py-2 px-4 rounded-lg hover:bg-indigo-500/30 transition-colors border border-indigo-500/20"
          >
            Editar Ativo
          </button>
        </div>
      </div>
    </div>
  );
});

export default AssetDetailsModal;