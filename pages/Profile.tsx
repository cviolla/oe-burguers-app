
import React from 'react';
import { supabase } from '../supabase';

interface ProfileProps {
  onBack: () => void;
  onSettings: () => void;
  onHistory: () => void;
  onAddresses?: () => void;
  onNavigate: (view: any) => void;
  onAdmin: () => void;
  userName: string;
  userPhone: string;
  preferredPayment?: string;
  savedAddress?: any;
  isAdmin?: boolean;
  deferredPrompt?: any;
  onPromptUsed?: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  onBack,
  onSettings,
  onHistory,
  onAddresses,
  onNavigate,
  onAdmin,
  userName,
  userPhone,
  preferredPayment,
  savedAddress,
  isAdmin,
  deferredPrompt,
  onPromptUsed
}) => {
  const lastOrders: any[] = [];

  return (
    <div className="pb-32">
      <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-dark-bg/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black shadow-xl shadow-primary/30">
            {userName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black">{userName || 'Usuário'}</h1>
            <p className="text-xs text-dark-text-secondary">{userPhone || 'Sem telefone cadastrado'}</p>
          </div>
        </div>
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-dark-text-secondary active:scale-95 transition-all shadow-lg"
        >
          <span className="material-icons-round">settings</span>
        </button>
      </header>

      <main className="px-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-dark-card py-3 px-6 rounded-[1.5rem] border border-white/5 shadow-lg flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-dark-text-secondary tracking-widest block">Total de Pedidos</span>
              <span className="text-primary text-2xl font-black block leading-none mt-1">0</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons-round text-xl">shopping_bag</span>
            </div>
          </div>
        </div>

        {/* Resumo Histórico */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-tight text-white/40">Resumo de Pedidos</h3>
            <button
              onClick={onHistory}
              className="text-primary text-xs font-bold uppercase cursor-pointer hover:underline"
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-3">
            {lastOrders.length === 0 ? (
              <div className="bg-dark-card p-6 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                <span className="material-icons-round text-white/5 text-3xl mb-2">history</span>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Sem pedidos</p>
              </div>
            ) : (
              [1, 2].map(i => (
                <div key={i} className="bg-dark-card p-4 rounded-3xl border border-white/5 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-icons-round">lunch_dining</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Pedido #894{i}</h4>
                        <p className="text-[10px] text-dark-text-secondary">{i === 1 ? 'Hoje às 19:45' : 'Ontem às 21:20'}</p>
                      </div>
                    </div>
                    <span className="bg-green-500/10 text-green-400 text-[8px] font-black px-2 py-1 rounded uppercase">Entregue</span>
                  </div>
                  <div className="border-t border-white/5 py-3 mb-3">
                    <p className="text-[10px] text-dark-text-secondary leading-relaxed">
                      1x Super OE Bacon Duplo, 1x Batata M, 1x Coca-Cola Zero
                    </p>
                    <p className="text-sm font-black mt-1">R$ 42,90</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20">Repetir Pedido</button>
                    <button className="px-5 border border-white/10 text-dark-text-secondary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Ajuda</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Últimos Pedidos - Lista Rápida */}
        <section>
          <h3 className="text-sm font-black uppercase tracking-tight text-white/40 mb-2">Pedidos Recentes</h3>
          {lastOrders.length === 0 ? (
            <div className="bg-dark-card/50 p-6 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
              <span className="material-icons-round text-white/5 text-3xl mb-2">receipt_long</span>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Lista vazia</p>
            </div>
          ) : (
            <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-xl">
              {lastOrders.map((order, idx) => (
                <div key={order.id} className={`p-4 flex items-center justify-between ${idx !== lastOrders.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-dark-bg flex items-center justify-center border border-white/5 text-primary">
                      <span className="material-icons-round text-lg">receipt_long</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{order.item}</h4>
                      <p className="text-[10px] text-dark-text-secondary">{order.date} • {order.id}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white">R$ {order.total}</span>
                </div>
              ))}
            </div>
          )}
        </section>



        {/* Instalação do App */}
        {typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-tight text-white/40 px-1">Aplicativo</h3>
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-xl">install_mobile</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">Instalar OE Burguer's</h4>
                  <p className="text-[10px] text-dark-text-secondary uppercase font-black tracking-widest leading-tight">Para acesso rápido</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest flex items-center gap-2">
                    No iPhone (Safari)
                    <span className="material-icons-round text-xs">apple</span>
                  </p>
                  <div className="flex items-start gap-2.5 bg-dark-bg/40 p-3 rounded-xl border border-white/5">
                    <span className="material-icons-round text-primary text-sm shrink-0">ios_share</span>
                    <p className="text-[11px] text-dark-text-secondary leading-normal">
                      Toque no ícone de <span className="text-white font-bold">Compartilhar</span> na barra do Safari e selecione <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest flex items-center gap-2">
                    No Android (Chrome)
                    <span className="material-icons-round text-xs font-normal">android</span>
                  </p>
                  <div className="flex items-start gap-2.5 bg-dark-bg/40 p-3 rounded-xl border border-white/5">
                    <span className="material-icons-round text-primary text-sm shrink-0">more_vert</span>
                    <p className="text-[11px] text-dark-text-secondary leading-normal">
                      Toque no <span className="text-white font-bold">Menu (3 pontos)</span> e escolha <span className="text-white font-bold">"Instalar aplicativo"</span>.
                    </p>
                  </div>
                </div>

                {deferredPrompt && (
                  <button
                    onClick={async () => {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        onPromptUsed?.();
                      }
                    }}
                    className="w-full bg-primary text-dark-bg py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all mt-2 animate-bounce"
                  >
                    Instalar Agora
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

    </div>
  );
};

export default Profile;
