
import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  cartCount: number;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, cartCount, onLogout }) => {
  const tabs: { view: AppView; label: string; icon: string }[] = [
    { view: 'home', label: 'Home', icon: 'home' },
    { view: 'cart', label: 'Carrinho', icon: 'shopping_cart' },
    { view: 'profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-dark-card/8 backdrop-blur-2xl border border-white/10 px-6 py-2.5 flex items-center justify-between z-50 rounded-[2.5rem] shadow-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.view}
          onClick={() => onNavigate(tab.view)}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === tab.view ? 'text-primary' : 'text-dark-text-secondary'
            }`}
        >
          <div className="relative">
            <span className="material-icons-round text-2xl">{tab.icon}</span>
            {tab.view === 'cart' && cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 text-rose-500/60 hover:text-rose-500 transition-all"
      >
        <span className="material-icons-round text-2xl">logout</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Sair</span>
      </button>
    </nav>
  );
};

export default Navbar;
