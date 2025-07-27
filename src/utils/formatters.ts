/**
 * Format a date to a readable string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

/**
 * Format a currency value
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount).replace('R$', '').trim();
};

/**
 * Calculate days until expiration (negative for expired)
 */
export const getDaysUntilExpiration = (dateString: string): number | null => {
  if (!dateString) return null;
  
  const expirationDate = new Date(dateString);
  const today = new Date();
  
  // Reset time component for accurate day calculation
  expirationDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get expiration status text and class
 */
export const getExpirationStatus = (dateString: string): { text: string, className: string } => {
  if (!dateString) return { text: 'Sem Expiração', className: 'text-gray-500' };
  
  const daysLeft = getDaysUntilExpiration(dateString);
  
  if (daysLeft === null) return { text: 'N/A', className: 'text-gray-500' };
  
  if (daysLeft < 0) {
    return { text: `Expirado há ${Math.abs(daysLeft)} dias`, className: 'text-red-600' };
  } else if (daysLeft === 0) {
    return { text: 'Expira hoje', className: 'text-orange-600 font-bold' };
  } else if (daysLeft <= 7) {
    return { text: `Expira em ${daysLeft} dias`, className: 'text-orange-600' };
  } else if (daysLeft <= 30) {
    return { text: `Expira em ${daysLeft} dias`, className: 'text-yellow-600' };
  } else {
    return { text: `Expira em ${daysLeft} dias`, className: 'text-green-600' };
  }
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-500/30';
    case 'expired':
      return 'bg-red-900/50 text-red-300 ring-1 ring-red-500/30';
    case 'pending':
      return 'bg-amber-900/50 text-amber-300 ring-1 ring-amber-500/30';
    case 'inactive':
      return 'bg-gray-700 text-gray-300 ring-1 ring-gray-500/30';
    default:
      return 'bg-blue-900/50 text-blue-300 ring-1 ring-blue-500/30';
  }
};

/**
 * Get asset type color class
 */
export const getAssetTypeColor = (type: string): string => {
  switch (type) {
    case 'dominio':
      return 'text-blue-400';
    case 'hospedagem':
      return 'text-emerald-400';
    case 'bm':
      return 'text-purple-400';
    case 'conta_de_anuncio':
      return 'text-amber-400';
    case 'perfil_do_facebook':
      return 'text-indigo-400';
    case 'pagina_do_facebook':
      return 'text-sky-400';
    case 'perfil_do_instagram':
      return 'text-pink-400';
    default:
      return 'text-zinc-400';
  }
};

/**
 * Get asset type display name
 */
export const getAssetTypeDisplay = (type: string): string => {
  switch (type) {
    case 'dominio':
      return 'Domínio';
    case 'hospedagem':
      return 'Hospedagem';
    case 'bm':
      return 'Business Manager';
    case 'conta_de_anuncio':
      return 'Conta de Anúncio';
    case 'perfil_do_facebook':
      return 'Perfil do Facebook';
    case 'pagina_do_facebook':
      return 'Página do Facebook';
    case 'pagina_do_instagram':
      return 'Página do Instagram';
    case 'outros':
      return 'Outro';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};