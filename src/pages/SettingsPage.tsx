import React, { useState, useEffect } from 'react';
import { Save, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsState {
  notifications: boolean
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true
  });

  const { profile, updateProfile, signOut } = useAuth();
  const [profileName, setProfileName] = useState(profile?.name || '');
  
  const [saved, setSaved] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    
    setSaved(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile
    updateProfile({ name: profileName });
    
    setSaved(true);
    
    // Hide the saved message after 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
  
  useEffect(() => {
    setProfileName(profile?.name || '');
  }, [profile]);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Configurações</h1>
        <p className="text-gray-400">Gerencie suas preferências e perfil</p>
      </div>
      
      <div className="bg-[#0B1120]/50 backdrop-blur-sm rounded-lg border border-indigo-500/10 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Perfil</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="pl-10 w-full px-3 py-2 bg-[#0B1120]/80 border border-indigo-500/20 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Notificações</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleChange}
                    className="h-4 w-4 bg-[#0B1120]/80 text-indigo-500 border-indigo-500/20 rounded focus:ring-indigo-500/30"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-300">
                    Ativar notificações
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end mt-6 pt-4 border-t">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col items-center gap-4">
                {saved && (
                  <span className="text-emerald-400 text-sm">
                    Configurações salvas com sucesso!
                  </span>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all duration-300 flex items-center justify-center whitespace-nowrap"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Configurações
                </button>
                
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;