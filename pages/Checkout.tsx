
import React, { useState } from 'react';
import { CartItem, ScheduledTime } from '../types';

export interface CheckoutData {
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  paymentMethod: string;
  observation: string;
  phone: string;
  name: string;
}

interface CheckoutProps {
  cartItems: CartItem[];
  onBack: () => void;
  onConfirm: (data: CheckoutData) => void;
  scheduledTime: ScheduledTime | null;
  onSelectSchedule: () => void;
  onClearSchedule: () => void;
  initialName?: string;
  initialPhone?: string;
  initialPayment?: string;
  initialAddress?: any;
  deliveryFees: any[];
  isLoading?: boolean;
  onUpdateName?: (name: string) => void;
  onUpdatePhone?: (phone: string) => void;
  onUpdateAddress?: (address: any) => void;
  onUpdatePayment?: (payment: string) => void;
  showAlert?: (title: string, message: string, icon?: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  onBack,
  onConfirm,
  scheduledTime,
  onSelectSchedule,
  onClearSchedule,
  initialName = '',
  initialPhone = '',
  initialPayment = 'pix',
  initialAddress = null,
  deliveryFees = [],
  isLoading = false,
  onUpdateName,
  onUpdatePhone,
  onUpdateAddress,
  onUpdatePayment,
  showAlert
}) => {
  const [formData, setFormData] = useState<CheckoutData>({
    street: initialAddress?.street || '',
    number: initialAddress?.number || '',
    neighborhood: initialAddress?.neighborhood || '',
    complement: initialAddress?.complement || '',
    paymentMethod: initialPayment,
    observation: '',
    phone: initialPhone,
    name: initialName
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const neighborhoodFee = deliveryFees.find(f =>
    f.neighborhood.trim().toLowerCase() === (formData?.neighborhood || '').trim().toLowerCase()
  );

  const hasPossibleMatch = formData.neighborhood.trim().length > 0 && deliveryFees.some(f =>
    f.neighborhood.trim().toLowerCase().includes(formData.neighborhood.trim().toLowerCase())
  );

  const deliveryFee = scheduledTime ? 0 : (neighborhoodFee ? neighborhoodFee.fee_cents / 100 : (subtotal > 50 ? 0 : 7.00));
  const total = subtotal + deliveryFee;

  const isFormValid = !!(
    formData.name.trim() &&
    formData.phone.trim().length >= 14 && // (00) 00000-0000
    (scheduledTime ? true : (formData.street.trim() && formData.number.trim() && neighborhoodFee))
  );





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'phone') {
      newValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);

      setFormData(prev => ({ ...prev, [name]: newValue }));
      onUpdatePhone?.(newValue);
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Sync specific fields to global state
      if (name === 'name') onUpdateName?.(newValue);

      // If any address field changes, update the whole address object in parent
      if (['street', 'number', 'neighborhood', 'complement'].includes(name)) {
        onUpdateAddress?.({
          street: updated.street,
          number: updated.number,
          neighborhood: updated.neighborhood,
          complement: updated.complement
        });
      }

      return updated;
    });
  };

  const handlePaymentSelect = (id: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: id }));
    onUpdatePayment?.(id);
  };

  const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: 'qr_code', color: 'text-[#32BCAD]' },
    { id: 'dinheiro', label: 'DINHEIRO', icon: 'payments', color: 'text-emerald-500' },
    { id: 'credito', label: 'CARTÃO DE CRÉDITO', icon: 'credit_card', color: 'text-blue-500' },
    { id: 'debito', label: 'CARTÃO DE DÉBITO', icon: 'credit_card', color: 'text-purple-500' },
    { id: 'mumbuca', label: 'MUMBUCA', icon: 'account_balance_wallet', color: 'text-orange-500' },
    { id: 'ppt', label: 'PPT', icon: 'stars', color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-ios bg-dark-bg flex flex-col">
      <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-dark-bg/80 backdrop-blur-md z-40 border-b border-white/5">
        <button onClick={onBack} className="flex items-center gap-1 text-primary active:scale-95 transition-all">
          <span className="material-icons-round">arrow_back_ios_new</span>
          <span className="text-xs font-bold">Voltar</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] text-dark-text-secondary font-black uppercase tracking-widest">Finalização</span>
          <h1 className="text-lg font-bold">Confirme seu Pedido</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 pb-44 space-y-8">
        {/* User Status (Moved up) */}
        <section className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
            <h2 className="text-base font-bold">Seus Dados</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Seu Nome</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Como devemos te chamar?"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all placeholder:text-dark-text-secondary/20"
                />
                {formData.name.trim().length >= 3 && (
                  <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm animate-in fade-in zoom-in">check_circle</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Seu WhatsApp / Telefone</label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all placeholder:text-dark-text-secondary/20"
                />
                {formData.phone.trim().length >= 14 && (
                  <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">check_circle</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Type / Scheduling */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <h2 className="text-base font-bold">Tipo de Entrega</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClearSchedule}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${!scheduledTime ? 'bg-primary/10 border-primary' : 'bg-dark-card border-white/5 opacity-50'
                }`}
            >
              <span className={`material-icons-round ${!scheduledTime ? 'text-primary' : 'text-dark-text-secondary'}`}>delivery_dining</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${!scheduledTime ? 'text-primary' : 'text-dark-text-secondary'}`}>Delivery</span>
            </button>
            <button
              onClick={onSelectSchedule}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${scheduledTime ? 'bg-primary/10 border-primary' : 'bg-dark-card border-white/5'
                }`}
            >
              <span className={`material-icons-round ${scheduledTime ? 'text-primary' : 'text-dark-text-secondary'}`}>storefront</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${scheduledTime ? 'text-primary' : 'text-dark-text-secondary'}`}>Retirada</span>
            </button>
          </div>

          {scheduledTime && (
            <div className="mt-4 bg-primary/5 border border-primary/20 p-5 rounded-3xl flex items-center justify-between animate-fade-in ring-1 ring-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <span className="material-icons-round text-xl">event_available</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.15em] mb-0.5">Horário Reservado</p>
                  <p className="text-sm font-bold text-white/90">{scheduledTime.date} • {scheduledTime.time}</p>
                </div>
              </div>
              <button onClick={onSelectSchedule} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary active:scale-90 transition-all">
                <span className="material-icons-round text-lg">edit_calendar</span>
              </button>
            </div>
          )}
        </section>

        {!scheduledTime && (
          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <h2 className="text-base font-bold">Informações de Entrega</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1">Bairro</label>
                <input
                  type="text"
                  name="neighborhood"
                  list="neighborhoods"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.setAttribute('list', 'neighborhoods')}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = ''; // Limpa para mostrar todas as opções
                    setFormData(prev => ({ ...prev, neighborhood: '' }));
                  }}
                  className={`w-full bg-dark-card border ${formData.neighborhood && !neighborhoodFee ? 'border-rose-500' : 'border-white/5'} rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all`}
                  placeholder="Clique para ver bairros"
                />

                <datalist id="neighborhoods">
                  {deliveryFees.filter(f => f.is_active).map(fee => (
                    <option key={fee.id} value={fee.neighborhood} />
                  ))}
                </datalist>
                {formData.neighborhood && !hasPossibleMatch && (
                  <p className="text-[9px] text-rose-500 font-black uppercase ml-1 tracking-widest animate-pulse">Ops! Ainda não entregamos nesta região.</p>
                )}
                {formData.neighborhood && hasPossibleMatch && !neighborhoodFee && (
                  <div className="flex items-center gap-1.5 ml-1 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-primary animate-pulse">verified</span>
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">
                      Identificamos cobertura! Continue digitando...
                    </p>
                  </div>
                )}
                {neighborhoodFee && (
                  <div className="flex items-center gap-1.5 ml-1 mt-1">
                    <span className="material-icons-round text-[10px] text-emerald-500">local_shipping</span>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                      Entrega disponível: {(neighborhoodFee.fee_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3 space-y-1.5 group">
                  <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Rua / Avenida</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all"
                    />
                    {formData.street.trim().length >= 5 && (
                      <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">check_circle</span>
                    )}
                  </div>
                </div>
                <div className="col-span-1 space-y-1.5 group">
                  <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Nº</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none text-center transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black uppercase text-dark-text-secondary ml-1 group-focus-within:text-primary transition-colors">Complemento</label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  placeholder="Apto, Bloco, Casa, etc."
                  className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>
          </section>
        )}

        {/* Observations */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">notes</span>
            </div>
            <h2 className="text-base font-bold">Observações do Pedido</h2>
          </div>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={handleInputChange}
            placeholder="Ex: Tirar cebola, maionese à parte..."
            rows={3}
            className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none resize-none transition-all placeholder:text-dark-text-secondary/20"
          />
        </section>

        {/* Payment */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <h2 className="text-base font-bold">Forma de Pagamento</h2>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 bg-dark-card border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-primary' : 'border-white/5'}`}
                onClick={() => handlePaymentSelect(method.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <span className={`material-icons-round ${method.color}`}>{method.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{method.label}</p>
                      <p className="text-[10px] text-dark-text-secondary uppercase tracking-widest">{formData.paymentMethod === method.id ? 'Selecionado' : 'Disponível'}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.id ? 'border-primary' : 'border-white/10'}`}>
                    {formData.paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="bg-dark-card rounded-3xl p-6 border border-white/5 shadow-xl">
          <h3 className="font-bold mb-4">Resumo do Pedido</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-dark-text-secondary">
              <span>Subtotal</span>
              <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm text-dark-text-secondary">
              <span>Taxa de entrega</span>
              <span className={deliveryFee === 0 ? "text-green-400 font-bold" : "text-dark-text-secondary"}>
                {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2">
              <span className="font-black">Total</span>
              <span className="text-2xl font-black text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-dark-bg/95 backdrop-blur-xl border-t border-white/5 p-6 pb-8 z-50 rounded-t-3xl shadow-2xl space-y-3">
        {!isFormValid && !isLoading && (
          <p className="text-[9px] text-rose-500 font-black uppercase text-center animate-pulse tracking-widest">Preencha todos os campos obrigatórios acima</p>
        )}
        <button
          onClick={() => {
            if (!isFormValid) {
              showAlert?.('Dados Incompletos', 'Por favor, preencha todos os campos obrigatórios corretamente para continuar.', 'warning');
              return;
            }
            onConfirm(formData);
          }}
          disabled={isLoading || !isFormValid}
          className={`w-full ${isLoading || !isFormValid ? 'bg-white/5 text-white/20' : 'bg-primary hover:bg-amber-600 text-dark-bg'} font-black py-4 rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]`}
        >
          {isLoading ? (
            <span className="material-icons-round animate-spin">sync</span>
          ) : (
            <span className="material-icons-round">
              {scheduledTime ? 'calendar_month' : 'shopping_cart_checkout'}
            </span>
          )}
          {isLoading ? 'Processando...' : (scheduledTime ? 'Agendar Pedido' : 'Finalizar Pedido')}
        </button>
      </footer>
    </div >
  );
};

export default Checkout;
