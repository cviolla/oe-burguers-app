
import React from 'react';

interface OnboardingProps {
  onStart: () => void;
  onLogin: () => void;
  onViewLegal: (slug: 'privacy-policy' | 'terms-of-use') => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStart, onLogin, onViewLegal }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with optimized quality */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=2071&auto=format&fit=crop"
          alt="Hambúrguer Gourmet"
          className="w-full h-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/90 to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full px-8 py-16 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6 relative">
            {/* Logo Text */}
            <img
              src="/logo.png"
              alt="OE BURGUER'S"
              className="h-[76px] object-contain drop-shadow-[0_0_15px_rgba(255,173,0,0.2)] animate-logo"
            />
            {/* Crown (Separate element or icon to animate) */}
            <span
              className="material-icons-round text-primary absolute -top-4 left-[calc(50%-75px)] text-3xl animate-crown"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,173,0,0.5))' }}
            >
              crown
            </span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            O Hambúrguer <br />
            <span className="text-primary">Perfeito</span> te espera.
          </h1>
          <p className="text-dark-text-secondary text-sm max-w-[280px] mx-auto leading-relaxed">
            OE Burguer's • O seu melhor lanche.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <button
              onClick={onStart}
              className="w-full max-w-[300px] mx-auto bg-primary py-[1.125rem] rounded-full text-dark-bg font-black text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Peça seu Lanche</span>
              <span className="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-6 h-6 rounded-full border border-dark-bg" alt="User" />
              ))}
            </div>
            <p className="text-[10px] text-dark-text-secondary font-bold uppercase tracking-widest">
              +5.000 clientes satisfeitos
            </p>
          </div>

          <p className="text-[10px] text-white/40 max-w-[280px] mx-auto leading-tight">
            Ao clicar em Peça seu Lanche, você aceita nossos{' '}
            <button onClick={() => onViewLegal('terms-of-use')} className="text-primary font-black uppercase tracking-widest hover:underline">Termos</button> e{' '}
            <button onClick={() => onViewLegal('privacy-policy')} className="text-primary font-black uppercase tracking-widest hover:underline">Privacidade</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
