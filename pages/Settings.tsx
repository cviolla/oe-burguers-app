
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
  onDeleteAccount: () => void;
  isAdmin?: boolean;
  onAdmin: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onNavigate, userName, userPhone, preferredPayment, savedAddress, onUpdateName, onUpdatePhone, onViewLegal, onDeleteAccount, isAdmin, onAdmin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAdminLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setAuthError(true);
      } else if (data.session) {
        onAdmin();
        setShowAuthModal(false);
        setPassword('');
        setEmail('');
      }
    } catch (err) {
      setAuthError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

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
    alert(`Abrindo: ${title}\nEsta funcionalidade está sendo integrada com o suporte via WhatsApp.`);
  };

  const handleDeleteAccount = () => {
    if (confirm('Tem certeza que deseja excluir sua conta definitivamente? Esta ação não pode ser desfeita.')) {
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
              action={() => {
                const newName = prompt('Digite seu novo nome:', userName);
                if (newName) onUpdateName(newName);
              }}
            />
            <SettingItem
              icon="phone"
              label="Telefone"
              sublabel={userPhone || 'Cadastrar telefone'}
              action={() => {
                const newPhone = prompt('Digite seu novo número de telefone:', userPhone);
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

        {/* Modo Editor Section */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <span className="material-icons-round text-[10px]">shield</span>
            Administração
          </h2>
          <div className="space-y-1.5">
            <div
              onClick={() => {
                if (isAdmin) {
                  onAdmin();
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="bg-primary/5 py-3 px-5 rounded-2xl flex items-center justify-between border border-primary/20 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-lg">admin_panel_settings</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-bold block text-primary leading-tight">Modo Admin</span>
                </div>
              </div>
              <span className="material-icons-round text-primary/40 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
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

      {/* Admin Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-[#130707]/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-xs bg-[#1C0D0D] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <span className="material-icons-round text-3xl">lock</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Área Restrita</h3>
              <p className="text-[10px] text-dark-text-secondary font-bold uppercase tracking-widest text-center">Digite a senha administrativa</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-text-secondary font-black uppercase tracking-widest ml-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-bg border border-white/5 rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/20 font-bold text-white"
                    placeholder="admin@oeburguers.com.br"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-dark-text-secondary font-black uppercase tracking-widest ml-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdminLogin();
                    }}
                    className={`w-full bg-dark-bg border ${authError ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/5'} rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/20 font-black tracking-[0.3em] text-white`}
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest text-center mt-2 animate-pulse">Credenciais Inválidas</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAdminLogin}
                  disabled={isAuthenticating}
                  className="w-full bg-primary py-4 rounded-xl text-dark-bg font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isAuthenticating && <span className="material-icons-round animate-spin text-sm">refresh</span>}
                  {isAuthenticating ? 'Autenticando...' : 'Entrar'}
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setPassword('');
                    setEmail('');
                    setAuthError(false);
                  }}
                  className="w-full py-4 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Settings;
