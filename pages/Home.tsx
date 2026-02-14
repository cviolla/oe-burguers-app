
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { searchMatch } from '../utils';

interface HomeProps {
  userName: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onLogout: () => void;
  cart: any[];
  onAddToCart: (product: Product, qty: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  storeStatus?: 'auto' | 'open' | 'closed';
  isOpen: boolean;
  onOpenInfo: () => void;
}

const Home: React.FC<HomeProps> = ({ userName, products, onProductClick, onLogout, cart, onAddToCart, onUpdateQty, storeStatus = 'auto', isOpen, onOpenInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Destaques');


  const categories = ['Destaques', 'Burgers', 'Combos', 'Batata-frita', 'Promoções', 'Sobremesas', 'Bebidas', 'Porções', 'Combo na Caixa'];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -15% 0px',
      threshold: [0, 0.1, 0.5]
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the entry that is most visible if multiple are intersecting
      const visibleEntries = entries.filter(e => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort by intersection ratio or just take the last one appearing in the viewport
        const bestEntry = visibleEntries.reduce((prev, curr) =>
          curr.intersectionRatio > prev.intersectionRatio ? curr : prev
        );
        const id = bestEntry.target.id.replace('cat-', '');
        setActiveCategory(id);

        const menuBtn = document.getElementById(`btn-${id}`);
        if (menuBtn) {
          menuBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const sections = document.querySelectorAll('.cat-section');
    sections.forEach((section) => observer.observe(section));

    // Fallback for reaching the bottom of the page
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom && categories.length > 0) {
        const lastCat = categories[categories.length - 1];
        // Only set if not already set by observer (to avoid conflicts)
        // But usually bottom scroll beats middle sections
        setActiveCategory(lastCat);
        const menuBtn = document.getElementById(`btn-${lastCat}`);
        if (menuBtn) {
          menuBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedSearchQuery, categories]); // Re-observe when items might change

  const scrollToCategory = (cat: string) => {
    const element = document.getElementById(`cat-${cat}`);
    if (element) {
      const offset = 160; // Approximate height of sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveCategory(cat);
  };

  useEffect(() => {
    if (searchQuery) setIsTyping(true);
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsTyping(false);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredProducts = products.filter((product) => {
    if (product.isActive === false) return false;
    const query = debouncedSearchQuery;
    return (
      searchMatch(product.name, query) ||
      searchMatch(product.category, query) ||
      searchMatch(product.description, query)
    );
  });

  const featuredProducts = products.filter(p => (p.isBestSeller || p.isPopular) && p.isActive !== false);

  const isSearching = searchQuery.length > 0;

  return (
    <div className="pb-40 animate-fade-in relative">
      <div className="sticky top-0 z-50 bg-[#130707] border-b border-white/5 shadow-2xl">
        <header className="px-6 pt-10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em] block mb-1">OE BURGUERS</span>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Olá, {userName}</h1>


            <a
              href="https://www.google.com/maps/search/?api=1&query=Praça+Nossa+Sra.+das+Gracas+-+Ponta+Negra,+Maricá+-+RJ,+Brasil"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] text-primary hover:opacity-80 transition-all mt-2.5 font-black uppercase tracking-wider group"
            >
              <span className="material-icons-round text-xs group-hover:scale-110 transition-transform">location_on</span>
              Praça N. Sra. das Graças
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1.5">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 cursor-pointer active:scale-95'}`}
                onClick={() => !isOpen && onOpenInfo()}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></span>
                <span className="text-[9px] font-black uppercase tracking-widest">{isOpen ? 'Aberto' : 'Fechado'}</span>
                {!isOpen && <span className="material-icons-round text-[10px] opacity-40">info</span>}
              </div>
              <p className="text-[9px] text-white/30 font-black tracking-[0.1em] uppercase whitespace-nowrap">18:00 às 00:30</p>
            </div>
          </div>
        </header>

        <section className="px-6 py-2 bg-[#130707]/95 backdrop-blur-xl">
          <div className="overflow-x-auto no-scrollbar flex gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`btn-${cat}`}
                onClick={() => scrollToCategory(cat)}
                className={`px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${activeCategory === cat
                  ? 'bg-primary text-dark-bg shadow-lg shadow-primary/20'
                  : 'bg-dark-card text-dark-text-secondary border border-white/5'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      </div >

      <main className="pt-2 space-y-4">
        <section className="px-6">
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary group-focus-within:text-primary transition-colors text-lg">
              {isTyping ? 'hourglass_empty' : 'search'}
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, categoria ou ingredientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-card border border-white/5 rounded-2xl py-2.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-dark-text-secondary/30"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-text-secondary hover:text-white"
              >
                <span className="material-icons-round text-lg">close</span>
              </button>
            )}
          </div>
        </section>

        {isSearching ? (
          <section className="px-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Resultados: {searchQuery}</h3>
              <span className="text-dark-text-secondary text-[10px] uppercase font-bold tracking-widest">{filteredProducts.length} itens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProducts.map((product) => {
                const quantity = cart.filter(item => item.id === product.id).reduce((acc, item) => acc + item.quantity, 0);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onClick={() => onProductClick(product)}
                    onAdd={(e) => {
                      e.stopPropagation();
                      onAddToCart(product, 1);
                    }}
                    onUpdate={(e, delta) => {
                      e.stopPropagation();
                      onUpdateQty(product.id, delta);
                    }}
                    isOpen={isOpen}
                  />
                );
              })}
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Destaques Section */}
            <section id="cat-Destaques" className="cat-section px-6">
              <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white/40 mb-2.5 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Destaques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {featuredProducts.map((product) => {
                  const quantity = cart.filter(item => item.id === product.id).reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={quantity}
                      onClick={() => onProductClick(product)}
                      onAdd={(e) => {
                        e.stopPropagation();
                        onAddToCart(product, 1);
                      }}
                      onUpdate={(e, delta) => {
                        e.stopPropagation();
                        onUpdateQty(product.id, delta);
                      }}
                      isOpen={isOpen}
                    />
                  );
                })}
              </div>
            </section>

            {/* Other Categories Sections */}
            {categories.filter(c => c !== 'Destaques').map(cat => {
              const catProducts = products.filter(p => p.category === cat && p.isActive !== false);
              if (catProducts.length === 0) return null;

              return (
                <section key={cat} id={`cat-${cat}`} className="cat-section px-6">
                  <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white/40 mb-2.5 ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                    {cat}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {catProducts.map((product) => {
                      const quantity = cart.filter(item => item.id === product.id).reduce((acc, item) => acc + item.quantity, 0);

                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantity={quantity}
                          onClick={() => onProductClick(product)}
                          onAdd={(e) => {
                            e.stopPropagation();
                            onAddToCart(product, 1);
                          }}
                          onUpdate={(e, delta) => {
                            e.stopPropagation();
                            onUpdateQty(product.id, delta);
                          }}
                          isOpen={isOpen}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>





    </div >
  );
};

const ProductCard: React.FC<{
  product: Product;
  quantity: number;
  onClick: () => void;
  onAdd: (e: React.MouseEvent) => void;
  onUpdate: (e: React.MouseEvent, delta: number) => void;
  isOpen: boolean;
}> = ({ product, quantity, onClick, onAdd, onUpdate, isOpen }) => (
  <div
    onClick={onClick}
    className="glass p-3 rounded-[2rem] flex gap-4 active:scale-[0.98] transition-all duration-500 group premium-shadow border border-white/5 relative overflow-hidden"
  >
    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-[1.5rem] shadow-xl">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      {product.isBestSeller && (
        <div className="absolute top-2 left-2 bg-amber-500 text-dark-bg text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">🔥 Best</div>
      )}
    </div>
    <div className="flex flex-col justify-between flex-1 py-1">
      <div>
        <h4 className="font-black text-sm text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-1">{product.name}</h4>
        <p className="text-[10px] text-white/30 line-clamp-2 leading-tight font-medium">{product.description}</p>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] leading-none mb-1">{product.category}</span>
          <span className="text-white font-black text-lg tracking-tighter leading-none">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-2.5 bg-dark-bg/60 backdrop-blur-3xl border border-white/10 rounded-full p-1 shadow-2xl animate-in zoom-in-50 duration-300">
            <button
              onClick={(e) => onUpdate(e, -1)}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-rose-500 transition-colors"
            >
              <span className="material-icons-round text-base">remove</span>
            </button>
            <span className="text-xs font-black text-white min-w-[12px] text-center">{quantity}</span>
            <button
              onClick={(e) => onUpdate(e, 1)}
              className="w-7 h-7 rounded-full bg-primary text-dark-bg flex items-center justify-center transition-all active:scale-95"
            >
              <span className="material-icons-round text-base">add</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="w-9 h-9 rounded-full bg-primary text-dark-bg flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-110 active:scale-90"
          >
            <span className="material-icons-round text-lg">add</span>
          </button>
        )}
      </div>
    </div>
  </div>
);


export default Home;

