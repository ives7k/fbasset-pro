import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, PlusCircle, Settings, X, Box } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/', 
      name: 'Visão Geral', 
      icon: <LayoutDashboard className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/assets', 
      name: 'Ativos', 
      icon: <Layers className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/add-asset', 
      name: 'Adicionar Ativo', 
      icon: <PlusCircle className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/settings', 
      name: 'Configurações', 
      icon: <Settings className="h-5 w-5 mr-3" /> 
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-zinc-950/50 border-r border-zinc-800 w-72 min-h-screen fixed top-0 z-30
        transition-all duration-300 ease-in-out backdrop-blur-sm
        ${isOpen ? 'left-0' : '-left-72 lg:left-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="h-6 w-6 text-zinc-400" />
            <span className="text-lg font-bold text-white">Asset Pro</span>
          </div>
          <button 
            className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

      <nav className="py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;