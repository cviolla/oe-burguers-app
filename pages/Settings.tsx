
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface SettingsProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  onViewLegal: (slug: 'privacy-policy' | 'terms-of-use') => void;
  onDeleteAccount: () => void;
  deferredPrompt?: any;
  onPromptUsed?: () => void;
  showAlert?: (title: string, message: string, icon?: string) => void;
  showConfirm?: (title: string, message: string, confirmText?: string, cancelText?: string, icon?: string) => Promise<boolean>;
}


const Settings: React.FC<SettingsProps> = ({ onBack, onNavigate, onViewLegal, onDeleteAccount, deferredPrompt, onPromptUsed, showAlert, showConfirm }) => {


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

        {/* Instalação do App - MOVED FROM PROFILE */}
        {typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Aplicativo</h2>
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
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest flex items-center gap-2 text-left">
                    No iPhone (Safari)
                    <span className="material-icons-round text-xs">apple</span>
                  </p>
                  <div className="flex items-start gap-2.5 bg-dark-bg/40 p-3 rounded-xl border border-white/5">
                    <span className="material-icons-round text-primary text-sm shrink-0">ios_share</span>
                    <p className="text-[11px] text-dark-text-secondary leading-normal text-left">
                      Toque no ícone de <span className="text-white font-bold">Compartilhar</span> na barra do Safari e selecione <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest flex items-center gap-2 text-left">
                    No Android (Chrome)
                    <span className="material-icons-round text-xs font-normal">android</span>
                  </p>
                  <div className="flex items-start gap-2.5 bg-dark-bg/40 p-3 rounded-xl border border-white/5">
                    <span className="material-icons-round text-primary text-sm shrink-0">more_vert</span>
                    <p className="text-[11px] text-dark-text-secondary leading-normal text-left">
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
