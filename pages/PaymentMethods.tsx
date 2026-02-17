
import React, { useState } from 'react';

interface PaymentMethodsProps {
    onBack: () => void;
    preferredPayment: string;
    onUpdatePayment: (method: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ onBack, preferredPayment, onUpdatePayment }) => {
    const [selectedMethod, setSelectedMethod] = useState(preferredPayment);

    const methods = [
        { id: 'pix', label: 'PIX', icon: 'qr_code', color: 'text-[#32BCAD]' },
        { id: 'dinheiro', label: 'DINHEIRO', icon: 'payments', color: 'text-emerald-500' },
        { id: 'credito', label: 'CARTÃO DE CRÉDITO', icon: 'credit_card', color: 'text-blue-500' },
        { id: 'debito', label: 'CARTÃO DE DÉBITO', icon: 'credit_card', color: 'text-purple-500' },
        { id: 'mumbuca', label: 'MUMBUCA', icon: 'account_balance_wallet', color: 'text-orange-500' },
        { id: 'ppt', label: 'PPT', icon: 'stars', color: 'text-amber-500' },
    ];

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col pb-10">
            <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 glass z-40 border-b border-white/5 rounded-b-[2.5rem]">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary active:scale-95 transition-all"
                >
                    <span className="material-icons-round">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-black text-white">Formas de Pagamento</h1>
                <div className="w-10"></div>
            </header>

            <main className="p-6 space-y-4">
                <div className="mb-4">
                    <p className="text-xs text-white/40 font-bold">Selecione o método de pagamento preferencial.</p>
                </div>

                <div className="space-y-2">
                    {methods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => {
                                setSelectedMethod(method.id);
                                onUpdatePayment(method.id);
                            }}
                            className={`py-3 px-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${selectedMethod === method.id
                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                : 'bg-dark-card border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-xl bg-dark-bg flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${selectedMethod === method.id ? 'text-primary' : 'text-white/20'}`}>
                                    <span className={`material-icons-round text-xl ${selectedMethod === method.id ? method.color : ''}`}>{method.icon}</span>
                                </div>
                                <h3 className={`font-black tracking-tight text-[13px] ${selectedMethod === method.id ? 'text-white' : 'text-white/40'}`}>
                                    {method.label}
                                </h3>
                            </div>

                            <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${selectedMethod === method.id ? 'border-primary' : 'border-white/10'
                                }`}>
                                {selectedMethod === method.id && (
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-in zoom-in duration-300"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 px-2">
                    <p className="text-[10px] text-white/30 leading-relaxed font-medium text-center">
                        <span className="text-primary font-black uppercase tracking-wider mr-1">Nota:</span>
                        A forma selecionada será priorizada no checkout e pode ser alterada a qualquer momento.
                    </p>
                </div>
            </main>

            <footer className="mt-auto px-6 pb-12 text-center">
                <p className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-bold">OE BURGUERS • Pagamentos Seguros</p>
            </footer>
        </div>
    );
};

export default PaymentMethods;
