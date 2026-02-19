
import React from 'react';
import { supabase } from '../supabase';

interface ProfileProps {
  onBack: () => void;
  onSettings: () => void;
  onHistory: () => void;
  onAddresses?: () => void;
  onNavigate: (view: any) => void;
  userName: string;
  userPhone: string;
  preferredPayment?: string;
  savedAddress?: any;
  onUpdateName: (name: string) => void;
  onUpdatePhone: (phone: string) => void;
  showPrompt?: (title: string, message: string, defaultValue?: string, placeholder?: string, icon?: string) => Promise<string | null>;
  userOrders?: any[];
  showAlert?: (title: string, message: string, icon?: string) => void;
  showConfirm?: (title: string, message: string, confirmText?: string, cancelText?: string, icon?: string) => Promise<boolean>;
  onRepeatOrder?: (order: any) => void;
}

const Profile: React.FC<ProfileProps> = ({
  onBack,
  onSettings,
  onHistory,
  onAddresses,
  onNavigate,
  userName,
  userPhone,
  preferredPayment,
  savedAddress,
  onUpdateName,
  onUpdatePhone,
  showPrompt,
  userOrders = [],
  showAlert,
  showConfirm,
  onRepeatOrder
}) => {
  const lastOrders = userOrders.slice(0, 3); // Pegar os 3 mais recentes

  const SettingItem = ({ icon, label, sublabel, action }: any) => (
    <div
      onClick={action}
      className="bg-dark-card py-2.5 px-4 rounded-xl border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-dark-bg border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <span className="material-icons-round text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-[13px] font-bold text-white leading-none mb-0.5">{label}</p>
          {sublabel && <p className="text-[9px] text-dark-text-secondary uppercase tracking-widest">{sublabel}</p>}
        </div>
      </div>
      <span className="material-icons-round text-dark-text-secondary group-hover:text-primary transition-colors text-lg">chevron_right</span>
    </div>
  );

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
        {/* Account Section - MOVED FROM SETTINGS */}
        <section className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1 mb-1">Minha Conta</h3>
          <div className="space-y-1.5 text-left">
            <SettingItem
              icon="person"
              label="Editar Perfil"
              sublabel={userName}
              action={async () => {
                const newName = await showPrompt?.('Editar Nome', 'Como devemos te chamar?', userName, 'Seu nome');
                if (newName) onUpdateName(newName);
              }}
            />
            <SettingItem
              icon="phone"
              label="Telefone"
              sublabel={userPhone || 'Cadastrar telefone'}
              action={async () => {
                const newPhone = await showPrompt?.('Editar WhatsApp', 'Digite seu novo número de telefone:', userPhone, '(00)00000-0000');
                if (newPhone) onUpdatePhone(newPhone);
              }}
            />
            <SettingItem
              icon="place"
              label="Endereços de Entrega"
              sublabel={savedAddress ? `${savedAddress.street}, ${savedAddress.number}` : "Gerenciar locais salvos"}
              action={() => onNavigate('addresses')}
            />
            <SettingItem
              icon="credit_card"
              label="Métodos de Pagamento"
              sublabel={
                preferredPayment === 'pix' ? 'PIX' :
                  preferredPayment === 'dinheiro' ? 'Dinheiro' :
                    preferredPayment === 'credito' ? 'Cartão de Crédito' :
                      preferredPayment === 'debito' ? 'Cartão de Débito' :
                        preferredPayment === 'mumbuca' ? 'Mumbuca' :
                          preferredPayment === 'ppt' ? 'PPT' :
                            'Selecione um método'
              }
              action={() => onNavigate('payment_methods')}
            />
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-dark-card py-3 px-6 rounded-[1.5rem] border border-white/5 shadow-lg flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-dark-text-secondary tracking-widest block">Total de Pedidos</span>
              <span className="text-primary text-2xl font-black block leading-none mt-1">{userOrders.length}</span>
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
              lastOrders.map(order => (
                <div key={order.id} className="bg-dark-card p-4 rounded-3xl border border-white/5 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-icons-round">lunch_dining</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Pedido #{order.short_id || order.id.slice(0, 5)}</h4>
                        <p className="text-[10px] text-dark-text-secondary">{new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${order.status === 'finalizado' ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="border-t border-white/5 py-3 mb-3">
                    <p className="text-[10px] text-dark-text-secondary leading-relaxed line-clamp-2">
                      {order.order_items?.map((item: any) => `${item.quantity}x ${item.product_name}`).join(', ') || 'Sem itens listados'}
                    </p>
                    <p className="text-sm font-black mt-1">R$ {(order.total_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRepeatOrder?.(order)}
                      className="flex-1 bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                      Repetir Pedido
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/5521972724360?text=${encodeURIComponent(`Olá! Preciso de ajuda com o meu pedido #${order.short_id || order.id.slice(0, 5)}`)}`, '_blank')}
                      className="px-5 border border-white/10 text-dark-text-secondary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Ajuda
                    </button>
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
                      <h4 className="font-bold text-sm">Pedido #{order.short_id || order.id.slice(0, 5)}</h4>
                      <p className="text-[10px] text-dark-text-secondary">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white">R$ {(order.total_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </section>



      </main>
    </div>
  );
};

export default Profile;
