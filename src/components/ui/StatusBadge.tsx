import React from 'react';
import { getStatusColor } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = getStatusColor(status);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} capitalize shadow-sm`}>
      {status}
    </span>
  );
};

export default StatusBadge;