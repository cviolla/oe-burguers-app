
import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCT_ADDONS } from '../constants';


interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (quantity: number, options: string[]) => void;
  addons?: any[];
  isAddonsVisible?: boolean;
  isOpen: boolean;
  showAlert?: (title: string, message: string, icon?: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, addons: propAddons, isAddonsVisible = true, isOpen, showAlert }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const addons = propAddons && propAddons.length > 0 ? propAddons : PRODUCT_ADDONS;

  const handleShare = async () => {
    const shareData = {
      title: `OE BURGUERS - ${product.name}`,
      text: `Olha só esse ${product.name} que encontrei no app da OE Burguers! 🍔`,
      url: window.location.origin,
    };

    try {
      // 1. Tenta a API nativa de compartilhamento (Mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      }
      // 2. Tenta a API de área de transferência moderna
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        showAlert?.('Sucesso', 'Link da loja copiado para a área de transferência! 📋', 'content_copy');
      }
      else {
        throw new Error('API de compartilhamento não disponível');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Usuário cancelou o compartilhamento

      // 3. Fallback final (ExecCommand) - Útil para conexões não-HTTPS em mobile
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareData.url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          showAlert?.('Sucesso', 'Link da loja copiado! 📋', 'content_copy');
        } else {
          showAlert?.('Compartilhar', 'Não foi possível compartilhar. Copie o link manualmente: ' + shareData.url, 'info');
        }
      } catch (fallbackErr) {
        showAlert?.('Link da Loja', 'Link da loja: ' + shareData.url, 'link');
      }
    }
  };


  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((acc, id) => {
      const addon = addons.find(a => a.id === id);
      if (!addon) return acc;
      const price = addon.price !== undefined ? addon.price : (addon.price_delta_cents ? addon.price_delta_cents / 100 : 0);
      return acc + price;
    }, 0);
  };

  const addonsTotal = calculateAddonsTotal();
  const subtotal = (product.price + addonsTotal) * quantity;

  const MAX_CHARS = 120;
  const shouldTruncate = product.description.length > MAX_CHARS;
  const displayedDescription = isExpanded || !shouldTruncate
    ? product.description
    : `${product.description.slice(0, MAX_CHARS)}...`;

  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between px-6 pt-12">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-dark-bg/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-10 h-10 rounded-full bg-dark-bg/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all ${isFavorite ? 'text-rose-500' : 'text-white'}`}
          >
            <span className="material-icons-round">{isFavorite ? 'favorite' : 'favorite_border'}</span>
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-dark-bg/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <span className="material-icons-round">share</span>
          </button>
        </div>
      </header>

      <div className="h-72 w-full relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent"></div>
      </div>

      <main className="px-6 -mt-8 relative z-10 pb-48">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">{product.name}</h2>
          <div className="text-dark-text-secondary text-sm leading-relaxed">
            {displayedDescription}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {addonsTotal > 0 && (
                <span className="text-[10px] text-white/30 font-bold mt-1 uppercase tracking-widest">+ R$ {addonsTotal.toFixed(2)} em adicionais</span>
              )}
            </div>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Mais Pedido</span>
          </div>
        </div>

        {/* Section: Add-ons */}
        {product.category === 'Burgers' && isAddonsVisible && (
          <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg uppercase tracking-tight">Adicionais</h3>
              <span className="text-[9px] bg-white/5 text-white/40 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">Opcional</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {addons.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex flex-col p-2 px-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${selectedAddons.includes(addon.id)
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                    : 'bg-dark-card border-white/5 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedAddons.includes(addon.id) ? 'bg-primary border-primary' : 'border-white/20'}`}>
                      {selectedAddons.includes(addon.id) && <span className="material-icons-round text-dark-bg text-[10px] font-black">check</span>}
                    </div>
                    <span className={`text-[11px] font-bold truncate ${selectedAddons.includes(addon.id) ? 'text-white' : 'text-white/60'}`}>
                      {addon.label || addon.name}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-black ${selectedAddons.includes(addon.id) ? 'text-primary' : 'text-white/30'}`}>
                      + R$ {(addon.price !== undefined ? addon.price : (addon.price_delta_cents ? addon.price_delta_cents / 100 : 0)).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => handleToggleAddon(addon.id)}
                  />
                </label>
              ))}
            </div>
          </section>
        )}




        {/* Section: Observations */}
        <section className="mb-8">
          <h3 className="font-black text-lg uppercase tracking-tight mb-4">Alguma observação?</h3>
          <textarea
            className="w-full bg-dark-card border border-white/5 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-primary outline-none placeholder:text-dark-text-secondary/20 transition-all shadow-inner"
            placeholder="Ex: Tirar cebola, maionese à parte..."
            rows={3}
          />
        </section>
      </main >

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-dark-card/90 backdrop-blur-2xl border border-white/10 p-5 z-50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 bg-dark-bg/60 p-1.5 rounded-full border border-white/5 shadow-inner">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-card text-white/50 hover:text-rose-500 active:scale-90 transition-all"
            >
              <span className="material-icons-round text-lg">remove</span>
            </button>
            <span className="font-black text-lg w-6 text-center text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-dark-bg transition-all shadow-xl active:scale-95 shadow-primary/20"
            >
              <span className="material-icons-round text-lg">add</span>
            </button>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-black text-white/20 block tracking-[0.2em] mb-0.5">Subtotal</span>
            <span className="text-xl font-black text-primary tracking-tighter">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <button
          onClick={() => {
            const selectedLabels = selectedAddons.map(id => {
              const fullAddon = addons.find(a => a.id === id);
              return fullAddon ? fullAddon.label || fullAddon.name : id;
            });
            onAddToCart(quantity, selectedLabels);
          }}
          className="w-full font-black py-4.5 rounded-[1.8rem] shadow-2xl transition-all flex items-center justify-center gap-3 group bg-primary hover:bg-white text-dark-bg shadow-primary/20 active:scale-[0.98]"
        >
          <span className="text-[13px] uppercase tracking-[0.2em]">Adicionar ao Carrinho</span>
          <span className="material-icons-round group-hover:translate-x-1 transition-transform">shopping_basket</span>
        </button>
      </footer>
    </div >

  );
};

export default ProductDetail;

