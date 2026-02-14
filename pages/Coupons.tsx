
import React from 'react';
import { MOCK_COUPONS } from '../constants';

interface CouponsProps {
  onBack: () => void;
}

const Coupons: React.FC<CouponsProps> = ({ onBack }) => {
  return (
    <div className="pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-dark-bg z-40">
        <button onClick={onBack} className="text-primary"><span className="material-icons-round">arrow_back_ios_new</span></button>
        <h1 className="text-xl font-bold">Meus Cupons</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-4">
          {MOCK_COUPONS.map((coupon) => (
            <div 
              key={coupon.id} 
              className="coupon-cutout bg-dark-card border-2 border-dashed border-primary/20 rounded-2xl p-5 flex items-center gap-4 overflow-hidden relative shadow-lg"
            >
              <div className="flex flex-col items-center justify-center min-w-[80px] text-primary">
                {coupon.type === 'shipping' ? (
                  <>
                    <span className="material-icons-round text-3xl">delivery_dining</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{coupon.discount}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black">{coupon.discount}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">OFF</span>
                  </>
                )}
              </div>
              <div className="h-10 border-l-2 border-dashed border-white/5"></div>
              <div className="flex-1">
                <h4 className="font-black text-sm">{coupon.code}</h4>
                <p className="text-[10px] text-dark-text-secondary leading-tight mt-1">{coupon.description}</p>
              </div>
              <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Aplicar
              </button>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h3 className="text-lg font-bold mb-6">Promoções Ativas</h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-dark-card rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                <div className="h-32 relative">
                  <img src={`https://picsum.photos/400/400?random=${i}`} className="w-full h-full object-cover" alt="Promo" />
                  {i % 2 === 0 && <span className="absolute top-2 left-2 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Popular</span>}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm truncate">Combo Especial {i}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold text-xs">R$ {(25 + i * 10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white"><span className="material-icons-round text-xs">add</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Coupons;

