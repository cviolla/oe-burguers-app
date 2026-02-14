
import React, { useState } from 'react';

interface LoginProps {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col px-8 py-12">
      <header className="mb-12">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-dark-card border border-white/5 flex items-center justify-center text-primary mb-10 active:scale-90 transition-all"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <h1 className="text-3xl font-black mb-2">Bem-vindo de volta!</h1>
        <p className="text-dark-text-secondary text-sm">Sentimos falta do seu apetite.</p>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-text-secondary ml-1">E-mail</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-card border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/20"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-text-secondary ml-1">Senha</label>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest">Esqueci a senha</button>
            </div>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-card border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="w-full bg-primary py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all mt-4"
        >
          Entrar
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-dark-bg px-4 text-[10px] font-black text-dark-text-secondary uppercase tracking-widest">Ou entre com</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-dark-card border border-white/5 py-4 rounded-2xl active:scale-[0.98] transition-all">
             {/* Use URL-encoded quotes (%22) instead of escaped double quotes (\") to prevent JSX parsing issues */}
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
             <span className="text-xs font-black uppercase tracking-widest">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-dark-card border border-white/5 py-4 rounded-2xl active:scale-[0.98] transition-all">
             <span className="material-icons-round text-xl">apple</span>
             <span className="text-xs font-black uppercase tracking-widest">Apple</span>
          </button>
        </div>
      </main>

      <footer className="mt-auto pt-8 text-center">
        <p className="text-dark-text-secondary text-xs">
          Não tem uma conta?{' '}
          <button onClick={onRegister} className="text-primary font-black uppercase tracking-widest">Cadastre-se</button>
        </p>
      </footer>
    </div>
  );
};

export default Login;
