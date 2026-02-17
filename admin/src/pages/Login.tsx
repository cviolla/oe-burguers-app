
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface LoginProps {
  onBack?: () => void;
  onLogin: () => void;
  onRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Success - App.tsx will detect session change
      if (onLogin) onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col px-8 py-12 justify-center">
      <header className="mb-12 text-center">
        <img src="/admin-logo.png" alt="OE Admin" className="w-40 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,183,0,0.3)]" />
        <p className="text-dark-text-secondary text-sm font-bold tracking-widest uppercase">Acesso Restrito</p>
      </header>

      <main className="flex-1 flex flex-col gap-6 max-w-sm mx-auto w-full">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-xs font-bold text-center">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-text-secondary ml-1">E-mail</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/20 text-white"
                placeholder="admin@oeburguers.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-text-secondary ml-1">Senha</label>
            </div>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary py-4 rounded-2xl text-dark-bg font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></span>
              Acessando...
            </>
          ) : 'Entrar como Admin'}
        </button>
      </main>

      <footer className="mt-auto pt-8 text-center opacity-30">
        <p className="text-[10px] uppercase font-black tracking-widest">
          criado por <a href="https://wa.me/5521965226788" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">cviolla</a>
        </p>
      </footer>
    </div>
  );
};

export default Login;
