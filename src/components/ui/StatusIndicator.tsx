import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'pending' | 'expired';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const baseClasses = "w-2 h-2 rounded-full relative";
  const pulseClasses = "absolute w-full h-full rounded-full animate-ping opacity-50";
  const textClasses = "ml-2 text-sm font-medium";
  
  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return { 
          dot: `${baseClasses} bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]`,
          pulse: `${pulseClasses} bg-emerald-400/30`,
          text: `${textClasses} text-emerald-400`
        };
      case 'pending':
        return {
          dot: `${baseClasses} bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]`,
          pulse: `${pulseClasses} bg-amber-400/30`,
          text: `${textClasses} text-amber-400`
        };
      case 'expired':
        return {
          dot: `${baseClasses} bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]`,
          pulse: `${pulseClasses} bg-red-400/30`,
          text: `${textClasses} text-red-400`
        };
    }
  };

  const classes = getStatusClasses();
  const statusText = status === 'online' ? 'Online' : status === 'pending' ? 'Pendente' : 'Expirado';

  return (
    <div className="flex items-center">
      <div className="relative flex items-center">
        <div className={classes.pulse} />
        <div className={classes.dot} />
      </div>
      <span className={classes.text}>{statusText}</span>
    </div>
  );
}

export default StatusIndicator;