
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Product } from './types';
import Editor from './pages/Editor';
import Login from './pages/Login';
import { INITIAL_PRODUCTS, PRODUCT_ADDONS } from './constants';

interface DialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  placeholder?: string;
  defaultValue?: string;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryFees, setDeliveryFees] = useState<any[]>([]);
  const [productAddons, setProductAddons] = useState<any[]>([]);
  const [storeStatus, setStoreStatus] = useState<'auto' | 'open' | 'closed'>('auto');
  const [loading, setLoading] = useState(false);

  // Dialog State
  const [dialog, setDialog] = useState<DialogConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: () => { },
    onCancel: () => { },
  });

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data Fetching
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) {
        const formattedProducts: Product[] = data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: parseFloat(p.price),
          image: p.image,
          category: p.category_name || 'Geral',
          category_id: p.category_id,
          isBestSeller: false,
          isPopular: false,
          isActive: p.is_active
        }));
        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setProducts(INITIAL_PRODUCTS); // Fallback
    }
  };

  const fetchDeliveryFees = async () => {
    try {
      const { data } = await supabase.from('delivery_fees').select('*').order('neighborhood', { ascending: true });
      if (data) setDeliveryFees(data);
    } catch (err) { console.error(err); }
  };

  const fetchAddons = async () => {
    try {
      const { data } = await supabase.from('options').select('*').order('sort_order', { ascending: true });
      if (data) setProductAddons(data);
    } catch (err) { console.error(err); }
  };

  const fetchStoreStatus = async () => {
    try {
      const { data } = await supabase.from('store_config').select('value').eq('key', 'store_status').single();
      if (data && data.value) setStoreStatus(data.value as any);
    } catch (err) { console.error(err); }
  };

  const refreshData = () => {
    fetchProducts();
    fetchDeliveryFees();
    fetchAddons();
    fetchStoreStatus();
  };

  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session]);


  // Dialog Functions
  const showAlert = (title: string, message: string, icon = 'info') => {
    return new Promise<void>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'alert',
        icon,
        onConfirm: () => { setDialog(prev => ({ ...prev, isOpen: false })); resolve(); },
        onCancel: () => { setDialog(prev => ({ ...prev, isOpen: false })); resolve(); },
        confirmText: 'Entendido'
      });
    });
  };

  const showConfirm = (title: string, message: string, confirmText = 'Confirmar', cancelText = 'Cancelar', icon = 'help_outline') => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        icon,
        confirmText,
        cancelText,
        onConfirm: () => { setDialog(prev => ({ ...prev, isOpen: false })); resolve(true); },
        onCancel: () => { setDialog(prev => ({ ...prev, isOpen: false })); resolve(false); }
      });
    });
  };

  const showPrompt = (title: string, message: string, defaultValue = '', placeholder = '', icon = 'edit') => {
    return new Promise<string | null>((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'prompt',
        icon,
        defaultValue,
        placeholder,
        onConfirm: (value) => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(value || '');
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        }
      });
    });
  };

  if (!session) {
    return (
      <>
        <Login onLogin={() => { }} />
        <CustomDialog config={dialog} />
      </>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen text-white">
      <Editor
        onBack={() => { }}
        products={products}
        onRefresh={refreshData}
        deliveryFees={deliveryFees}
        addons={productAddons}
        storeStatus={storeStatus}
        onLogout={() => supabase.auth.signOut()}
        showAlert={showAlert}
        showConfirm={showConfirm}
      />
      <CustomDialog config={dialog} />
    </div>
  );
}

const CustomDialog: React.FC<{ config: DialogConfig }> = ({ config }) => {
  const [inputValue, setInputValue] = useState(config.defaultValue || '');

  useEffect(() => {
    if (config.isOpen) {
      setInputValue(config.defaultValue || '');
    }
  }, [config.isOpen, config.defaultValue]);

  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={config.type === 'alert' ? () => config.onConfirm() : config.onCancel}
      />
      <div className="bg-dark-card w-full max-w-xs rounded-[2rem] border border-white/10 shadow-2xl relative z-[201] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/5">
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shadow-primary/5">
            <span className="material-icons-round text-3xl">{config.icon || (config.type === 'alert' ? 'info' : 'help_outline')}</span>
          </div>

          <div className="space-y-2 w-full">
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{config.title}</h3>
            <p className="text-xs text-dark-text-secondary leading-relaxed font-medium px-2">
              {config.message}
            </p>
          </div>

          {config.type === 'prompt' && (
            <div className="w-full mt-2">
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={config.placeholder}
                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') config.onConfirm(inputValue);
                  if (e.key === 'Escape') config.onCancel();
                }}
              />
            </div>
          )}
        </div>

        <div className="flex border-t border-white/5">
          {config.type !== 'alert' && (
            <button
              onClick={config.onCancel}
              className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-dark-text-secondary hover:bg-white/5 transition-colors border-r border-white/5 active:bg-white/10"
            >
              {config.cancelText || 'Cancelar'}
            </button>
          )}
          <button
            onClick={() => config.onConfirm(inputValue)}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-colors active:bg-primary/20 text-primary hover:bg-white/5`}
          >
            {config.confirmText || (config.type === 'confirm' ? 'Confirmar' : config.type === 'prompt' ? 'Salvar' : 'Entendido')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
