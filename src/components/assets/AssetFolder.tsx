import React from 'react';
import { Folder } from 'lucide-react';
import { Asset, AssetType, AssetStatus } from '../../types';
import { getAssetTypeDisplay } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';

interface AssetFolderProps {
  type: AssetType;
  assets: Asset[];
  onClick: () => void;
}

const getFolderColor = (type: AssetType): string => {
  switch (type) {
    case 'dominio':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'hospedagem':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'bm':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'conta_de_anuncio':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'perfil_do_facebook':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'pagina_do_facebook':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    case 'perfil_do_instagram':
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
    default:
      return 'bg-[#0B1120]/50 border-indigo-500/10 hover:bg-indigo-500/10 group-hover:text-indigo-400';
  }
};

const AssetFolder: React.FC<AssetFolderProps> = ({ type, assets, onClick }) => {
  const statusCount = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<AssetStatus, number>);

  // Ordenar os status por quantidade (decrescente)
  const sortedStatuses = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className={`group cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-300 ${getFolderColor(type)}`}
      onClick={onClick}
    >
      <div className="p-4 flex items-center">
        <Folder className="h-12 w-12 text-zinc-400 mr-4 transition-transform duration-200 group-hover:scale-110" />
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {getAssetTypeDisplay(type)}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {sortedStatuses.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-sm text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetFolder;