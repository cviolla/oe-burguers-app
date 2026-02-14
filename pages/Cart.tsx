
import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemove: (cartId: string) => void;

  onClear: () => void;
  onCheckout: () => void;
  onBack: () => void;
  isOpen: boolean;
}



const Cart: React.FC<CartProps> = ({ cartItems, onUpdateQty, onRemove, onClear, onCheckout, onBack, isOpen }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 50 ? 0 : 7.00;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-10 text-center gap-6">
        <div className="w-32 h-32 bg-dark-card rounded-full flex items-center justify-center text-dark-text-secondary/20">
          <span className="material-icons-round text-7xl">shopping_cart</span>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Seu carrinho está vazio</h2>
          <p className="text-dark-text-secondary text-sm">Que tal escolher um hambúrguer delicioso?</p>
        </div>
        <button
          onClick={onBack}
          className="bg-primary text-dark-bg px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          Ver Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 glass z-40 border-b border-white/5 rounded-b-[2.5rem]">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary active:scale-95 transition-all">
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <h1 className="text-xl font-black text-white">Seu Carrinho</h1>
        <button onClick={onClear} className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/10 active:scale-95 transition-all">Limpar</button>
      </header>


      <main className="px-6 py-6 pb-64 space-y-8">
        <section>
          <h2 className="text-xs font-black text-dark-text-secondary uppercase tracking-[0.2em] mb-4">Itens Selecionados</h2>
          <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-xl">
            {cartItems.map((item, idx) => (
              <div key={item.cartId || item.id} className={`p-4 flex gap-4 ${idx !== cartItems.length - 1 ? 'border-b border-white/5' : ''}`}>
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <button onClick={() => onRemove(item.cartId || item.id)} className="text-rose-500"><span className="material-icons-round text-sm">delete</span></button>
                    </div>

                    {item.options && item.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.options.map((opt, i) => (
                          <span key={i} className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tight">
                            + {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-black">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div className="flex items-center gap-3 bg-dark-bg p-1.5 rounded-full border border-white/5 shadow-inner">
                      <button
                        onClick={() => onUpdateQty(item.cartId || item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-dark-card text-white/40 hover:text-primary transition-all active:scale-90"
                      >
                        <span className="material-icons-round text-sm">remove</span>
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.cartId || item.id, 1)}
                        disabled={!isOpen}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isOpen ? 'bg-primary text-dark-bg active:scale-90 shadow-lg shadow-primary/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                      >
                        <span className="material-icons-round text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md glass border-t border-white/5 p-6 pb-10 z-50 rounded-t-[3rem] premium-shadow animate-fade-in">
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-xs font-bold text-white/30 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-white/30 uppercase tracking-widest">
            <span>Taxa de entrega</span>
            <span className={deliveryFee === 0 ? 'text-emerald-400 font-black' : 'text-white'}>
              {deliveryFee === 0 ? 'FRETE GRÁTIS' : `R$ ${deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between items-center pt-5 border-t border-white/5 mt-4">
            <span className="text-sm font-black uppercase text-white/40 tracking-[0.2em]">Total</span>
            <span className="text-2xl font-black text-primary">R$ {(subtotal + deliveryFee).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <button
          onClick={onCheckout}
          className={`w-full font-black py-5 rounded-full flex items-center justify-center gap-4 transition-all uppercase tracking-[0.2em] text-xs ${isOpen ? 'bg-gradient-to-br from-primary to-primary/80 text-dark-bg shadow-2xl shadow-primary/20 active:scale-[0.98]' : 'bg-white/5 text-white/20 cursor-not-allowed shadow-none'}`}
        >
          <span className="material-icons-round text-xl">{isOpen ? 'payments' : 'lock'}</span>
          {isOpen ? 'Finalizar Pedido' : 'Loja Fechada'}
        </button>
      </footer>

    </div>
  );
};

export default Cart;

