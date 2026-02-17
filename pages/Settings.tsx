
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface SettingsProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  userName: string;
  userPhone: string;
  preferredPayment: string;
  savedAddress: any;
  onUpdateName: (name: string) => void;
  onUpdatePhone: (phone: string) => void;
  onViewLegal: (slug: 'privacy-policy' | 'terms-of-use') => void;
  showAlert?: (title: string, message: string, icon?: string) => void;
  showConfirm?: (title: string, message: string, confirmText?: string, cancelText?: string, icon?: string) => Promise<boolean>;
  showPrompt?: (title: string, message: string, defaultValue?: string, placeholder?: string, icon?: string) => Promise<string | null>;
}


const Settings: React.FC<SettingsProps> = ({ onBack, onNavigate, userName, userPhone, preferredPayment, savedAddress, onUpdateName, onUpdatePhone, onViewLegal, onDeleteAccount, showAlert, showConfirm, showPrompt }) => {


  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('oe_notifications');
    return saved ? JSON.parse(saved) : { push: true };
  });

  const toggleNotification = (key: 'push') => {
    setNotifications((prev: any) => {
      const newState = { ...prev, [key]: !prev[key] };
      localStorage.setItem('oe_notifications', JSON.stringify(newState));
      return newState;
    });
  };

  const SettingItem = ({ icon, label, sublabel, action, type = 'arrow' }: any) => (
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

      {type === 'arrow' && (
        <span className="material-icons-round text-dark-text-secondary group-hover:text-primary transition-colors text-lg">chevron_right</span>
      )}

      {type === 'toggle' && (
        <div
          className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 relative pointer-events-none ${sublabel === 'Ativado' ? 'bg-primary' : 'bg-dark-border'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${sublabel === 'Ativado' ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      )}
    </div>
  );

  const handleHelpClick = (title: string) => {
    showAlert?.('Suporte', `O suporte para "${title}" está sendo integrado com nosso WhatsApp. Por favor, aguarde novidades!`, 'help_outline');
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm?.(
      'Excluir Conta?',
      'Tem certeza que deseja excluir sua conta definitivamente? Esta ação não pode ser desfeita.',
      'Sim, excluir',
      'Cancelar',
      'person_remove'
    );
    if (confirmed) {
      onDeleteAccount();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-20">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-40 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <div>
          <h1 className="text-xl font-black">Configurações</h1>
          <p className="text-[10px] text-dark-text-secondary uppercase tracking-widest">Personalize sua experiência</p>
        </div>
      </header>

      <main className="px-6 py-4 space-y-6">
        {/* Account Section */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Minha Conta</h2>
          <div className="space-y-1.5">
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
                const newPhone = await showPrompt?.('Editar WhatsApp', 'Digite seu novo número de telefone:', userPhone, '(00) 00000-0000');
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

        {/* Notifications Section */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Notificações</h2>
          <div className="space-y-1.5">
            <SettingItem
              icon="notifications_active"
              label="Notificações Push"
              sublabel={notifications.push ? "Ativado" : "Desativado"}
              type="toggle"
              action={() => toggleNotification('push')}
            />
          </div>
        </section>




        {/* Legal & Support Section */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Suporte e Legal</h2>
          <div className="space-y-1.5">
            <SettingItem icon="verified_user" label="Política de Privacidade" action={() => onViewLegal('privacy-policy')} />
            <SettingItem icon="description" label="Termos de Uso" action={() => onViewLegal('terms-of-use')} />
          </div>
        </section>

        <div className="pt-1 pb-10 flex flex-col items-center gap-4">
          <button
            onClick={handleDeleteAccount}
            className="text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 px-6 py-2.5 rounded-full hover:bg-rose-500/5 transition-colors active:scale-95"
          >
            Excluir Conta
          </button>
          <p className="text-[8px] text-dark-text-secondary uppercase tracking-[0.3em]">
            • DESENVOLVIDO POR <a href="https://wa.me/5521965226788" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">@cviolla</a>
          </p>
        </div>
      </main>


    </div>

  );
};

export default Settings;
