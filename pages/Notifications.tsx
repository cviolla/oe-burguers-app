
import React from 'react';

interface NotificationsProps {
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
  return (
    <div className="pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-dark-bg z-40 border-b border-white/5">
        <button onClick={onBack} className="text-primary"><span className="material-icons-round">arrow_back_ios_new</span></button>
        <h1 className="text-lg font-bold">Notificações</h1>
        <button className="text-primary text-sm font-bold">Limpar</button>
      </header>

      <main className="p-6 space-y-6">
        <section>
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] mb-4">Recentes</h2>
          <div className="space-y-4">
            <div className="bg-dark-card p-5 rounded-3xl border border-white/5 relative shadow-xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-primary">redeem</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">Cupom de 20% Disponível!</h3>
                    <span className="text-[10px] text-dark-text-secondary">2h atrás</span>
                  </div>
                  <p className="text-xs text-dark-text-secondary leading-relaxed">Aproveite nosso cupom exclusivo 'OE20' para sua próxima compra acima de R$50.</p>
                </div>
              </div>
              <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full"></div>
            </div>
            
            <div className="bg-dark-card p-5 rounded-3xl border border-white/5 relative shadow-xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-green-500">lunch_dining</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">Pedido a caminho!</h3>
                    <span className="text-[10px] text-dark-text-secondary">45m atrás</span>
                  </div>
                  <p className="text-xs text-dark-text-secondary leading-relaxed">Seu OE Duplo Bacon está saindo para entrega. Prepare o apetite!</p>
                </div>
              </div>
              <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] mb-4">Anteriores</h2>
          <div className="space-y-4 opacity-60">
             <div className="bg-dark-card/50 p-5 rounded-3xl border border-white/5 flex gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-dark-text-secondary">notifications</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">Novidades no Menu</h3>
                    <span className="text-[10px] text-dark-text-secondary">Ontem</span>
                  </div>
                  <p className="text-xs text-dark-text-secondary leading-relaxed">Conheça nossa nova linha de shakes artesanais. O de Nutella está incrível!</p>
                </div>
              </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Notifications;
