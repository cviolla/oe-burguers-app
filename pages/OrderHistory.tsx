
import React, { useState, useMemo } from 'react';
import { searchMatch } from '../utils';

interface Order {
  id: string;
  date: string;
  timestamp: number;
  items: string;
  price: number;
  status: 'Entregue' | 'Cancelado' | 'Em Preparo';
  image: string;
}

interface OrderHistoryProps {
  onBack: () => void;
  onRepeatOrder: (order: Order) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack, onRepeatOrder }) => {
  const [activeFilter, setActiveFilter] = useState<number>(0); // 0: Tudo, 7, 30, 90 dias
  const [searchQuery, setSearchQuery] = useState('');

  // Datas mockadas para o exemplo (baseado na data atual)
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const MOCK_ORDERS: Order[] = [];


  const filters = [
    { label: 'Tudo', value: 0 },
    { label: '7 Dias', value: 7 },
    { label: '30 Dias', value: 30 },
    { label: '90 Dias', value: 90 },
  ];

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter(order => {
      const matchesSearch = searchMatch(order.items, searchQuery) || order.id.includes(searchQuery);
      if (activeFilter === 0) return matchesSearch;

      const filterMs = activeFilter * dayInMs;
      const isWithinTime = (now - order.timestamp) <= filterMs;
      return matchesSearch && isWithinTime;
    });
  }, [activeFilter, searchQuery, now, dayInMs]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-20">
      {/* Header Fixo */}
      <header className="px-6 pt-12 pb-6 bg-dark-bg/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all"
          >
            <span className="material-icons-round">arrow_back_ios_new</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Meu Histórico</h1>
            <p className="text-[10px] text-dark-text-secondary uppercase tracking-widest font-bold">Gerencie seus pedidos passados</p>
          </div>
        </div>

        {/* Busca em tempo real */}
        <div className="relative group">
          <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            placeholder="Buscar por item ou #ID do pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/30"
          />
        </div>
      </header>

      <main className="px-6 pt-6">
        {/* Chips de Filtro Temporal */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-6 mb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 active:scale-95 ${activeFilter === f.value
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-dark-card text-dark-text-secondary border border-white/5'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Listagem de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={order.image} alt="Pedido" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">Pedido {order.id}</h4>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${order.status === 'Entregue' ? 'bg-green-500/10 text-green-500' :
                            order.status === 'Cancelado' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-dark-text-secondary font-bold uppercase tracking-widest mt-0.5">{order.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white">R$ {order.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="bg-dark-bg/50 p-3 rounded-xl border border-white/5 mb-4">
                    <p className="text-[11px] text-dark-text-secondary leading-relaxed line-clamp-2">
                      {order.items}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onRepeatOrder(order)}
                      className="flex-1 bg-primary text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round text-sm">reorder</span>
                      Repetir Pedido
                    </button>
                    <button className="px-5 bg-dark-card border border-white/10 text-dark-text-secondary py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                      Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center text-dark-text-secondary/10 mb-6">
                <span className="material-icons-round text-5xl">history</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nenhum pedido encontrado</h3>
              <p className="text-xs text-dark-text-secondary">Tente ajustar seus filtros temporais ou o termo de busca para localizar sua compra.</p>
              <button
                onClick={() => { setActiveFilter(0); setSearchQuery(''); }}
                className="mt-6 text-primary font-black uppercase text-[10px] tracking-widest underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer minimalista de info */}
      <footer className="mt-10 px-6 pb-12 text-center">
        <p className="text-[8px] text-dark-text-secondary uppercase tracking-[0.4em] font-bold">OE BURGUERS • O seu melhor lanche</p>
      </footer>
    </div>
  );
};

export default OrderHistory;

