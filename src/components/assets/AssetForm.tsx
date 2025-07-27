import React, { useState } from 'react';
import { Asset, AssetType, AssetStatus } from '../../types';
import { X, Trash2 } from 'lucide-react';

interface AssetFormProps {
  initialData?: Partial<Asset>;
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'dominio', label: 'Domínio' },
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'bm', label: 'Business Manager' },
  { value: 'conta_de_anuncio', label: 'Conta de Anúncio' },
  { value: 'perfil_do_facebook', label: 'Perfil do Facebook' },
  { value: 'pagina_do_facebook', label: 'Página do Facebook' },
  { value: 'perfil_do_instagram', label: 'Perfil do Instagram' },
  { value: 'outros', label: 'Outro' }
];

const assetStatuses: { value: AssetStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20' },
  { value: 'expired', label: 'Expirado', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20' },
  { value: 'pending', label: 'Pendente', color: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/20' },
  { value: 'inactive', label: 'Inativo', color: 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30 border-zinc-500/20' }
];

const AssetForm: React.FC<AssetFormProps> = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialData.name || '',
    type: initialData.type || 'dominio', // Corrigido de 'domain' para 'dominio'
    status: initialData.status || 'online',
    cost: initialData.cost || 0,
    expirationDate: initialData.expirationDate || '',
    tags: initialData.tags || []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cost') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field when it's changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (formData.cost < 0) {
      newErrors.cost = 'Custo não pode ser negativo';
    }
    
    if (formData.expirationDate && isNaN(new Date(formData.expirationDate).getTime())) {
      newErrors.expirationDate = 'Formato de data inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Adiciona a tag atual se houver alguma antes de salvar
    const updatedFormData = {
      ...formData,
      tags: tagInput.trim() 
        ? [...formData.tags, tagInput.trim()]
        : formData.tags
    };
    
    if (validateForm()) {
      setTagInput(''); // Limpa o input após adicionar
      onSubmit(updatedFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0B1120]/50 backdrop-blur-sm rounded-lg border border-indigo-500/10 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
            Nome do Ativo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-indigo-500/10'
            } rounded-md bg-[#0B1120]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder-zinc-500`}
            placeholder="Digite o nome do ativo"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        {/* Type field */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-zinc-300 mb-1">
            Tipo do Ativo
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-indigo-500/10 rounded-md bg-[#0B1120]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {assetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {assetStatuses.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: status.value })}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${status.color} ${
                  formData.status === status.value ? 'ring-2 ring-offset-2 ring-offset-black' : ''
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Cost field */}
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-zinc-300 mb-1">
            Custo
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              R$
            </span>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full pl-12 pr-3 py-2 border ${
                errors.cost ? 'border-red-500' : 'border-indigo-500/10'
              } rounded-md bg-[#0B1120]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
        </div>
        
        {/* Expiration Date field */}
        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-zinc-300 mb-1">
            Data de Expiração
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate ? formData.expirationDate.substring(0, 10) : ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-indigo-500/10 rounded-md bg-[#0B1120]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              errors.expirationDate ? 'border-red-500' : ''
            }`}
          />
          {errors.expirationDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
          )}
        </div>
        
        {/* Tags field */}
        <div className="md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium text-zinc-300 mb-1">
            Etiquetas
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => {
                const value = e.target.value;
                setTagInput(value);
                // Adiciona a tag automaticamente quando o usuário digita vírgula
                if (value.endsWith(',')) {
                  const newTag = value.slice(0, -1).trim();
                  if (newTag && !formData.tags.includes(newTag)) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, newTag]
                    });
                    setTagInput('');
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const newTag = tagInput.trim();
                  if (newTag && !formData.tags.includes(newTag)) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, newTag]
                    });
                    setTagInput('');
                  }
                }
              }}
              className="w-full px-3 py-2 border border-indigo-500/10 rounded-l-md bg-[#0B1120]/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Digite as etiquetas e pressione Enter ou use vírgula"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-r-md hover:bg-indigo-500/30 transition-colors whitespace-nowrap border border-indigo-500/10"
            >
              Adicionar
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-[#0B1120]/80 text-zinc-200 px-2 py-1 rounded-full text-sm border border-indigo-500/10"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-zinc-400 hover:text-white focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4 border-t border-indigo-500/10">
        {initialData.id && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 border border-indigo-500/10 rounded-md text-zinc-400 hover:bg-[#0B1120]/80 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/10 hover:bg-indigo-500/30 hover:border-indigo-500/20 transition-all duration-300"
        >
          Salvar Ativo
        </button>
      </div>
    </form>
  );
};

export default AssetForm;