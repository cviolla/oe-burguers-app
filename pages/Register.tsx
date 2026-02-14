
import React, { useState } from 'react';

interface RegisterProps {
  onBack: () => void;
  onRegister: (name: string, phone: string) => void;
  onLogin: () => void;
  onViewLegal: (slug: 'privacy-policy' | 'terms-of-use') => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onRegister, onLogin, onViewLegal }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col px-8 py-12 animate-fade-in">
      <header className="mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-dark-card border border-white/5 flex items-center justify-center text-primary mb-6 active:scale-90 transition-all shadow-lg"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <h1 className="text-4xl font-black mb-3 tracking-tight">
          <span className="text-primary">Agilize</span> seu pedido
        </h1>
        <p className="text-dark-text-secondary text-sm leading-relaxed">Rápido, simples e delicioso. Junte-se a família OE Burguers.</p>
      </header>

      <main className="flex-1 flex flex-col gap-4">
        <div className="space-y-4">
          {/* Nome */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Seu nome</label>
            <div className="relative">
              <span className="material-icons-round absolute left-5 top-1/2 -translate-y-1/2 text-dark-text-secondary text-xl transition-colors group-focus-within:text-primary">person</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-dark-card border-2 border-white/5 rounded-[2rem] py-4 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-dark-text-secondary/30 font-medium"
                placeholder="Como quer ser chamado?"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">WhatsApp</label>
            <div className="relative">
              <span className="material-icons-round absolute left-5 top-1/2 -translate-y-1/2 text-dark-text-secondary text-xl transition-colors group-focus-within:text-primary">phone</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-dark-card border-2 border-white/5 rounded-[2rem] py-4 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-dark-text-secondary/30 font-medium"
                placeholder="(00) 90000-0000"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-4">
          <p className="text-[9px] text-dark-text-secondary uppercase tracking-widest font-bold text-center">Documento Oficial OE BURGUERS</p>
          <p className="text-[8px] text-dark-text-secondary text-center px-8 leading-relaxed opacity-60">
            Ao clicar em Continuar, você aceita nossos{' '}
            <button onClick={() => onViewLegal('terms-of-use')} className="text-primary font-black uppercase tracking-widest hover:underline">Termos</button> e{' '}
            <button onClick={() => onViewLegal('privacy-policy')} className="text-primary font-black uppercase tracking-widest hover:underline">Privacidade</button>.
          </p>

          <button
            onClick={() => onRegister(formData.name, formData.phone)}
            disabled={!formData.name || !formData.phone}
            className="w-full bg-primary py-4 rounded-full text-dark-bg font-black text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            Continuar
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative bg-dark-bg px-4 text-[10px] font-black text-dark-text-secondary uppercase tracking-widest">Ou</span>
          </div>

          <button
            onClick={() => onRegister('Cliente')}
            className="w-full bg-secondary/20 border border-secondary/40 py-4 rounded-full text-white font-bold text-sm active:scale-[0.98] transition-all"
          >
            Acessar sem cadastro
          </button>
        </div>
      </main>

    </div>
  );
};

export default Register;
