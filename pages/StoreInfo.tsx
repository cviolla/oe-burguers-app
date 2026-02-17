
import React from 'react';

interface StoreInfoProps {
    isOpen: boolean;
    onBack: () => void;
    onContinue?: () => void;
    showAlert?: (title: string, message: string, icon?: string) => void;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ isOpen, onBack, onContinue, showAlert }) => {
    const operatingHours = [
        { day: 'Domingo', hours: '18:00 - 00:30' },
        { day: 'Segunda-feira', hours: '18:00 - 00:30' },
        { day: 'Terça-feira', hours: '18:00 - 00:30' },
        { day: 'Quarta-feira', hours: '18:00 - 00:30' },
        { day: 'Quinta-feira', hours: '18:00 - 00:30' },
        { day: 'Sexta-feira', hours: '18:00 - 00:30' },
        { day: 'Sábado', hours: '18:00 - 00:30' },
    ];

    const handleShare = async () => {
        const shareData = {
            title: 'OE Burguers',
            text: 'Confira os melhores hambúrgueres artesanais na OE Burguers!',
            url: window.location.origin,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.origin);
                showAlert?.('Sucesso', 'Link copiado para a área de transferência!', 'content_copy');
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
            // Fallback para cópia se o compartilhamento falhar ou for cancelado
            try {
                await navigator.clipboard.writeText(window.location.origin);
                showAlert?.('Sucesso', 'Link copiado para a área de transferência!', 'content_copy');
            } catch (copyErr) {
                console.error('Erro ao copiar link:', copyErr);
            }
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white animate-fade-in pb-20">
            <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 glass z-40 border-b border-white/5 rounded-b-[2.5rem]">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary active:scale-95 transition-all">
                    <span className="material-icons-round">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-black text-white">Sobre a Loja</h1>
                <div className="w-10"></div>
            </header>

            <main className="px-6 py-4 space-y-3">
                {/* Status */}
                <div className="flex flex-col items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></span>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{isOpen ? 'Aberto Agora' : 'Fechado Agora'}</span>
                    </div>
                </div>

                {/* Logo */}
                <div className="flex flex-col items-center text-center">
                    <img src="/logo.png" alt="OE Burguers" className="w-44 h-auto object-contain drop-shadow-[0_0_20px_rgba(255,173,0,0.3)]" onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://oqjtlyshoxpkyvaxkldc.supabase.co/storage/v1/object/public/products/LOGOTIPO%20OE%20BURGUER.png';
                    }} />
                </div>

                {/* Address */}
                <a
                    href="https://www.google.com/maps/search/?api=1&query=Praça+Nossa+Sra.+das+Gracas+-+Ponta+Negra,+Maricá+-+RJ,+Brasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[85%] mx-auto flex items-center gap-3 bg-dark-card/50 p-3.5 rounded-2xl border border-white/5 group active:scale-[0.98] transition-all"
                >
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-icons-round text-lg">location_on</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-primary mb-0.5">Localização</h3>
                        <p className="text-[13px] font-bold text-white leading-snug">Praça N. Sra. das Graças - Ponta Negra</p>
                    </div>
                    <span className="material-icons-round text-[16px] text-white/20 group-hover:text-primary transition-colors">open_in_new</span>
                </a>

                {/* Social and Share */}
                <div className="flex flex-row justify-center gap-4">
                    <a href="https://wa.me/5521972724360" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-full active:scale-95 transition-all" title="WhatsApp">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 pointer-events-none" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </a>
                </div>

                {/* Operating Hours */}
                <section className="bg-dark-card/50 rounded-[2.5rem] border border-white/5 p-5 pb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-icons-round text-base">schedule</span>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Horário de Funcionamento</h3>
                    </div>
                    <div className="space-y-2">
                        {operatingHours.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <span className="text-xs font-bold text-dark-text-secondary group-hover:text-white transition-colors">{item.day}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-white">{item.hours}</span>
                                    <span className="material-icons-round text-xs text-primary">schedule</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {onContinue && (
                    <button
                        onClick={onContinue}
                        className="w-[60%] mx-auto bg-primary text-dark-bg font-black py-4 rounded-[1.8rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-3"
                    >
                        Ver Cardápio
                        <span className="material-icons-round text-lg">restaurant_menu</span>
                    </button>
                )}
            </main>
        </div>
    );
};

export default StoreInfo;
