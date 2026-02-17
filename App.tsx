
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Product, CartItem, ScheduledTime, DeliveryFee } from './types';
import { INITIAL_PRODUCTS, PRODUCT_ADDONS } from './constants';

import { supabase } from './supabase';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Coupons from './pages/Coupons';
import Checkout, { CheckoutData } from './pages/Checkout';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import Addresses from './pages/Addresses';
import Scheduling from './pages/Scheduling';
import Notifications from './pages/Notifications';
import PaymentMethods from './pages/PaymentMethods';


import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Legal from './pages/Legal';
import Editor from './pages/Editor';
import StoreInfo from './pages/StoreInfo';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [session, setSession] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('oe_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [lastCompletedCart, setLastCompletedCart] = useState<CartItem[]>([]);
  const [scheduledTime, setScheduledTime] = useState<ScheduledTime | null>(null);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('oe_user_name') || '');
  const [userPhone, setUserPhone] = useState<string>(() => localStorage.getItem('oe_user_phone') || '');
  const [preferredPayment, setPreferredPayment] = useState<string>(() => localStorage.getItem('oe_preferred_payment') || 'pix');
  const [savedAddress, setSavedAddress] = useState<any>(() => {
    const saved = localStorage.getItem('oe_saved_address');
    return saved ? JSON.parse(saved) : null;
  });
  const [legalDoc, setLegalDoc] = useState<'privacy-policy' | 'terms-of-use'>('privacy-policy');
  const [loading, setLoading] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState<any[]>([]);
  const [productAddons, setProductAddons] = useState<any[]>([]);
  const [isAddonsVisible, setIsAddonsVisible] = useState(true);
  const [storeStatus, setStoreStatus] = useState<'auto' | 'open' | 'closed'>('auto');
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>(() => {
    const saved = localStorage.getItem('oe_addresses');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('oe_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('oe_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('oe_user_phone', userPhone);
  }, [userPhone]);

  useEffect(() => {
    localStorage.setItem('oe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('oe_preferred_payment', preferredPayment);
  }, [preferredPayment]);

  useEffect(() => {
    if (savedAddress) {
      localStorage.setItem('oe_saved_address', JSON.stringify(savedAddress));
    } else {
      localStorage.removeItem('oe_saved_address');
    }
  }, [savedAddress]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userName && userPhone.length >= 14) {
      const timer = setTimeout(async () => {
        try {
          await supabase.from('customers').upsert({
            phone: userPhone,
            name: userName
          }, { onConflict: 'phone' });
        } catch (e) {
          console.warn("Silent background persist failed:", e);
        }
      }, 5000); // 5s debounce
      return () => clearTimeout(timer);
    }
  }, [userName, userPhone]);

  useEffect(() => {
    fetchProducts();
    fetchDeliveryFees();
    fetchAddons();
    fetchStoreStatus();

    // Limpar nomes de teste do localStorage se existirem
    const cachedName = localStorage.getItem('oe_user_name');
    if (cachedName === 'Andres' || cachedName === 'andres') {
      localStorage.removeItem('oe_user_name');
      setUserName('');
    }

    // Limpar endereços de teste do localStorage
    const cachedAddresses = localStorage.getItem('oe_addresses');
    if (cachedAddresses && (cachedAddresses.includes('Avenida Paulista') || cachedAddresses.includes('Haddock Lobo'))) {
      localStorage.removeItem('oe_addresses');
      localStorage.removeItem('oe_saved_address');
      setAddresses([]);
      setSavedAddress(null);
    }
    window.history.replaceState({ view: currentView }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Solicitar permissão de notificação no primeiro clique (necessário para iOS/Safari)
    const requestNotificationPermission = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      window.removeEventListener('click', requestNotificationPermission);
    };
    window.addEventListener('click', requestNotificationPermission);

    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('click', requestNotificationPermission);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const checkOpenStatus = () => {
      if (storeStatus === 'open') {
        setIsOpen(true);
        return;
      }
      if (storeStatus === 'closed') {
        setIsOpen(false);
        return;
      }

      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTimeNumber = hour * 100 + minutes;

      // Horário: 18:00 às 00:30 (transição de meia-noite)
      const isNight = currentTimeNumber >= 1800 && currentTimeNumber <= 2359;
      const isMorning = currentTimeNumber >= 0 && currentTimeNumber <= 30; // Até 00:30

      setIsOpen(isNight || isMorning);
    };

    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(timer);
  }, [storeStatus]);

  // Efeito para garantir que a página 'store_info' só apareça quando a loja estiver fechada
  useEffect(() => {
    // Não redirecionar se estiver logado como admin ou em telas de gestão
    if (currentView === 'editor') return;

    if (isOpen) {
      // Se a loja está aberta e o usuário está na store_info, manda para home
      if (currentView === 'store_info') {
        setCurrentView('home');
      }
    } else {
      // Se a loja está fechada, redireciona para store_info apenas se o usuário tentar ir para o checkout ou agendamento
      const restrictedViews = ['checkout', 'scheduling', 'cart'];
      if (restrictedViews.includes(currentView)) {
        setCurrentView('store_info');
      }
    }
  }, [isOpen, currentView, userName]);

  useEffect(() => {
    // Só adiciona ao histórico se a view atual for diferente da última registrada
    if (window.history.state?.view !== currentView) {
      window.history.pushState({ view: currentView }, '');
    }
    // Garante que a página abra sempre no topo ao trocar de view
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar gatilhos de teclado se estiver digitando em um input ou textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Enter') {
          // Se for Enter no input, permite o comportamento padrão de submit/fechamento
          return;
        }
        if (e.key !== 'Escape') return; // Esc sempre volta, mesmo em inputs
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'Escape':
          handleGlobalBack();
          break;
        case 'ArrowRight':
        case 'Enter':
          handleGlobalForward();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, cart, selectedProduct]); // Dependências para garantir que os handlers tenham o estado atual

  const handleGlobalBack = () => {
    switch (currentView) {
      case 'product_detail':
      case 'cart':
      case 'coupons':
      case 'profile':
      case 'editor':
        setCurrentView('home');
        break;
      case 'checkout':
        setCurrentView('cart');
        break;
      case 'scheduling':
        setCurrentView('checkout');
        break;
      case 'settings':
        setCurrentView('profile');
        break;
      case 'addresses':
      case 'payment_methods':
      case 'legal':
        setCurrentView('settings');
        break;
      case 'order_history':
        setCurrentView('profile');
        break;
      case 'login':
        setCurrentView('onboarding');
        break;
    }
  };

  const recoverUserData = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_phone', phone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastOrder = data[0];

        // Recover payment method
        if (lastOrder.payment_method) {
          setPreferredPayment(lastOrder.payment_method);
          localStorage.setItem('oe_preferred_payment', lastOrder.payment_method);
        }

        // Recover address - try to parse from concatenated delivery_address if needed
        if (lastOrder.neighborhood) {

          // Extract street and number from delivery_address (Format: "Street, Number - Complement")
          const addrParts = (lastOrder.delivery_address || '').split(',');
          const street = addrParts[0]?.trim() || '';
          const numComp = addrParts[1]?.split('-') || [];
          const number = numComp[0]?.trim() || '';
          const complement = numComp[1]?.trim() || '';

          const recoveredAddr = {
            street,
            number,
            neighborhood: lastOrder.neighborhood,
            complement
          };

          setSavedAddress(recoveredAddr);

          localStorage.setItem('oe_saved_address', JSON.stringify(recoveredAddr));
        }
      }
    } catch (err) {
      console.error("Erro ao recuperar dados do usuário:", err);
    }
  };

  const handleGlobalForward = () => {
    switch (currentView) {
      case 'onboarding':
        setCurrentView('home');
        break;
      case 'cart':
        if (cart.length > 0) setCurrentView('checkout');
        break;
      case 'home':
        if (cart.length > 0) setCurrentView('cart');
        break;
      // Adicionar outras navegações automáticas conforme necessário
    }
  };

  const fetchStoreStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select('value')
        .eq('key', 'store_status')
        .single();

      if (data && data.value) {
        setStoreStatus(data.value as any);
      }
    } catch (err) {
      console.error("Erro ao buscar status da loja:", err);
    }
  };

  const fetchAddons = async () => {
    try {
      const { data: groupData } = await supabase
        .from('option_groups')
        .select('is_active')
        .eq('slug', 'adicionais')
        .single();

      if (groupData) setIsAddonsVisible(groupData.is_active);

      const { data, error } = await supabase
        .from('options')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setProductAddons(data);
    } catch (err) {
      console.error("Erro ao buscar adicionais:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

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
      // Fallback para os dados iniciais se falhar
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const fetchDeliveryFees = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_fees')
        .select('*')
        .order('neighborhood', { ascending: true });

      if (error) throw error;
      if (data) setDeliveryFees(data);
    } catch (err) {
      console.error('Erro ao carregar taxas de entrega:', err);
      // Fallback ou inicialização se estiver vazio
    }
  };

  const addToCart = (product: Product, quantity: number = 1, options: string[] = []) => {
    if (!isOpen) {
      alert("A loja está fechada no momento. Por favor, volte durante nosso horário de funcionamento (18:00 às 00:30).");
      return;
    }
    setCart(prev => {
      // Find if an identical item (same ID and options) exists
      const existingIndex = prev.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.options || []) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        const item = newCart[existingIndex];
        newCart[existingIndex] = { ...item, quantity: item.quantity + quantity };
        return newCart;
      }

      // Calculate total price with add-ons
      const addonsTotal = options.reduce((acc, opt) => {
        const addon = PRODUCT_ADDONS.find(a => a.label === opt);
        return acc + (addon ? addon.price : 0);
      }, 0);

      const cartId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return [...prev, { ...product, price: product.price + addonsTotal, quantity, options, cartId }];
    });
    setCurrentView('home');
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    if (!isOpen && delta > 0) {
      alert("A loja está fechada. Você pode apenas remover itens ou reduzir quantidades.");
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    if (window.confirm('Deseja realmente limpar seu carrinho?')) {
      setCart([]);
    }
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product_detail');
  };

  const handleConfirmOrder = async (orderData: CheckoutData) => {
    setLoading(true);
    const subtotalCents = cart.reduce((acc, item) => acc + (item.price * item.quantity * 100), 0);

    // Pegar taxa do bairro selecionado
    const neighborhoodFee = deliveryFees.find(f =>
      f.neighborhood.toLowerCase() === (orderData.neighborhood || '').toLowerCase()
    );

    const deliveryFeeCents = scheduledTime ? 0 : (neighborhoodFee ? neighborhoodFee.fee_cents : (subtotalCents > 5000 ? 0 : 700));
    const totalCents = subtotalCents + deliveryFeeCents;

    try {
      const { data: dbOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_name: orderData.name || userName || 'Cliente OE Burguer',
          client_phone: orderData.phone,
          total_cents: totalCents,
          status: 'pendente',
          payment_method: orderData.paymentMethod,
          delivery_address: `${orderData.street}, ${orderData.number}${orderData.complement ? ' - ' + orderData.complement : ''}`,
          neighborhood: orderData.neighborhood,
          observation: orderData.observation,
          is_pickup: !!scheduledTime
        })
        .select()
        .single();

      if (orderError) {
        console.error("Erro Supabase ao criar pedido:", orderError);
        throw new Error(`Erro no banco: ${orderError.message}`);
      }

      if (!dbOrder) {
        throw new Error("O pedido foi criado, mas não conseguimos recuperar os detalhes. Por favor, fale conosco no WhatsApp.");
      }

      const orderDataTyped = dbOrder as any;

      // Tenta salvar o cliente silenciosamente (pode falhar por RLS, mas não deve travar o pedido)
      try {
        await supabase.from('customers').upsert({
          phone: orderData.phone,
          name: orderData.name || userName
        }, { onConflict: 'phone' });
      } catch (e) {
        console.warn("Erro ao salvar perfil do cliente (não crítico):", e);
      }

      // Save as preferences for next time
      localStorage.setItem('oe_preferred_payment', orderData.paymentMethod);
      localStorage.setItem('oe_saved_address', JSON.stringify({
        street: orderData.street,
        number: orderData.number,
        neighborhood: orderData.neighborhood,
        complement: orderData.complement
      }));
      setPreferredPayment(orderData.paymentMethod);
      setSavedAddress({
        street: orderData.street,
        number: orderData.number,
        neighborhood: orderData.neighborhood,
        complement: orderData.complement
      });


      const orderItems = cart.map(item => ({
        order_id: orderDataTyped.id,
        product_name: item.name,
        quantity: item.quantity,
        price_cents: Math.round(item.price * 100)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // WhatsApp Message Generation
      const storeWhatsApp = "5521972724360";
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const itemsList = cart.map(item => {
        const optionsStr = item.options && item.options.length > 0 ? `\n   *Adicionais: ${item.options.join(', ')}*` : '';
        const totalPrice = (item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `*X${item.quantity} ${item.name}* ${optionsStr}\n   R$ ${totalPrice}`;
      }).join('\n\n');
      const orderId = orderDataTyped.short_id || orderDataTyped.id.slice(0, 5).toUpperCase();

      const message = `👋 Venho de OE BURGUERS (https://oe-burguers.vercel.app)
#${orderId}
🗓️ ${dateStr} ⏰ ${timeStr}

Tipo de serviço: ${scheduledTime ? 'Retirada' : 'Delivery'}

Nome: ${orderData.name || userName}
Telefone: ${orderData.phone}
Endereço: ${orderData.neighborhood}, ${orderData.street} #${orderData.number} ${orderData.complement ? '- ' + orderData.complement : ''}

📝 Produtos
${itemsList}

Subtotal: R$ ${(subtotalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Delivery: ${deliveryFeeCents === 0 ? 'Grátis' : `R$ ${(deliveryFeeCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
Total: R$ ${(totalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

💲 Pagamento
Estado do pagamento: Não pago
Total a pagar: R$ ${(totalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${orderData.paymentMethod.toUpperCase() === 'PIX' ? 'PIX ' + (totalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + '\n21972724360 Natany (itau) | Envie o comprovante para 21 97272-4360' : 'Pagamento via: ' + orderData.paymentMethod.toUpperCase()}

👆 Por favor, envie-nos o comprovante do PIX. Assim que recebermos estaremos atendendo você.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${storeWhatsApp}?text=${encodedMessage}`;

      // Redirecionar para o WhatsApp - Usando location.assign para evitar bloqueio de popup no Safari iOS após await
      window.location.assign(whatsappUrl);

      setLastCompletedCart([...cart]);
      setCart([]);
      setCurrentView('home');
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      alert("Houve um erro ao processar seu pedido: " + (error.message || "Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair de sua conta? Seus dados salvos serão removidos deste dispositivo.')) {
      localStorage.removeItem('oe_user_name');
      localStorage.removeItem('oe_user_phone');
      localStorage.removeItem('oe_preferred_payment');
      localStorage.removeItem('oe_saved_address');
      localStorage.removeItem('oe_cart');
      setUserName('');
      setUserPhone('');
      setPreferredPayment('pix');
      setSavedAddress(null);
      setCart([]);
      setCurrentView('onboarding');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onStart={() => {
          if (!isOpen) {
            setCurrentView('store_info');
          } else {
            setCurrentView('home');
          }
        }} onLogin={() => setCurrentView('login')} onViewLegal={(slug) => {
          setLegalDoc(slug);
          setCurrentView('legal');
        }} />;
      case 'login':
        return <Login onBack={() => setCurrentView('onboarding')} onLogin={() => setCurrentView('home')} onResetPassword={() => { }} />;
      case 'home':
        return (
          <Home
            userName={userName}
            products={products}
            onProductClick={navigateToProduct}
            onLogout={handleLogout}
            cart={cart}
            onAddToCart={addToCart}
            onUpdateQty={(id, delta) => {
              const item = cart.find(i => i.id === id && (!i.options || i.options.length === 0));
              if (item && item.cartId) {
                updateQuantity(item.cartId, delta);
              } else if (delta > 0) {
                const product = products.find(p => p.id === id);
                if (product) addToCart(product, 1);
              }
            }}
            storeStatus={storeStatus}
            isOpen={isOpen}
            onOpenInfo={() => setCurrentView('store_info')}
          />
        );
      case 'product_detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setCurrentView('home')}
            onAddToCart={(qty, opts) => addToCart(selectedProduct, qty, opts)}
            addons={productAddons}
            isAddonsVisible={isAddonsVisible}
            isOpen={isOpen}
          />
        ) : null;
      case 'cart':
        return <Cart cartItems={cart} onUpdateQty={updateQuantity} onRemove={removeFromCart} onClear={clearCart} onCheckout={() => isOpen ? setCurrentView('checkout') : alert("Não é possível finalizar o pedido com a loja fechada.")} onBack={() => setCurrentView('home')} isOpen={isOpen} />;
      case 'store_info':
        return (
          <StoreInfo
            isOpen={isOpen}
            onBack={() => {
              if (!userName) { // Se não tem nome definido
                setCurrentView('onboarding');
              } else {
                setCurrentView('home');
              }
            }}
            onContinue={() => {
              setCurrentView('home');
            }}
          />
        );
      case 'checkout':
        return (
          <Checkout
            cartItems={cart}
            onBack={() => setCurrentView('cart')}
            onConfirm={handleConfirmOrder}
            scheduledTime={scheduledTime}
            onSelectSchedule={() => setCurrentView('scheduling')}
            onClearSchedule={() => setScheduledTime(null)}
            initialName={userName}
            initialPhone={userPhone}
            initialPayment={preferredPayment}
            initialAddress={savedAddress}
            deliveryFees={deliveryFees}
            isLoading={loading}
            onUpdateName={setUserName}
            onUpdatePhone={setUserPhone}
            onUpdateAddress={setSavedAddress}
            onUpdatePayment={setPreferredPayment}
          />
        );
      case 'scheduling':
        return (
          <Scheduling
            onBack={() => setCurrentView('checkout')}
            onConfirm={(time) => {
              setScheduledTime(time);
              setCurrentView('checkout');
            }}
          />
        );

      case 'coupons':
        return <Coupons onBack={() => setCurrentView('home')} />;
      case 'profile':
        return (
          <Profile
            userName={userName}
            userPhone={userPhone}
            preferredPayment={preferredPayment}
            savedAddress={savedAddress}
            onBack={() => setCurrentView('home')}
            onSettings={() => setCurrentView('settings')}
            onHistory={() => setCurrentView('order_history')}
            onAddresses={() => setCurrentView('addresses')}
            onNavigate={setCurrentView}
            onAdmin={() => setCurrentView('editor')}
            isAdmin={!!session}
            deferredPrompt={deferredPrompt}
            onPromptUsed={() => setDeferredPrompt(null)}
          />
        );
      case 'order_history':
        return <OrderHistory onBack={() => setCurrentView('profile')} onRepeatOrder={(order) => {
          const p = products.find(prod => order.items.includes(prod.name)) || products[0];
          addToCart(p, 1);
        }} />;
      case 'addresses':
        return <Addresses onBack={() => setCurrentView('settings')} addresses={addresses} setAddresses={setAddresses} deliveryFees={deliveryFees} />;

      case 'settings':
        return (
          <Settings
            onBack={() => setCurrentView('profile')}
            onNavigate={setCurrentView}
            userName={userName}
            userPhone={userPhone}
            preferredPayment={preferredPayment}
            savedAddress={savedAddress}
            onUpdateName={setUserName}
            onUpdatePhone={setUserPhone}
            isAdmin={!!session}
            onAdmin={() => setCurrentView('editor')}
            onViewLegal={(slug) => {
              setLegalDoc(slug);
              setCurrentView('legal');
            }}
            onDeleteAccount={() => {
              localStorage.removeItem('oe_user_name');
              localStorage.removeItem('oe_user_phone');
              localStorage.removeItem('oe_preferred_payment');
              localStorage.removeItem('oe_saved_address');
              localStorage.removeItem('oe_cart');
              localStorage.removeItem('oe_addresses');
              setUserName('');
              setUserPhone('');
              setPreferredPayment('pix');
              setSavedAddress(null);
              setCart([]);
              setAddresses([]);
              setCurrentView('onboarding');
            }}
          />
        );
      case 'notifications':
        return <Notifications onBack={() => setCurrentView('home')} />;
      case 'payment_methods':
        return (
          <PaymentMethods
            onBack={() => setCurrentView('settings')}
            preferredPayment={preferredPayment}
            onUpdatePayment={setPreferredPayment}
          />
        );
      case 'legal':
        return <Legal slug={legalDoc} onBack={() => setCurrentView('settings')} />;
      case 'editor':
        if (!session) {
          setCurrentView('home');
          return null;
        }
        return (
          <Editor
            onBack={() => setCurrentView('home')}
            products={products}
            onRefresh={() => {
              fetchProducts();
              fetchAddons();
              fetchStoreStatus();
              fetchDeliveryFees();
            }}
            deliveryFees={deliveryFees}
            addons={productAddons}
            storeStatus={storeStatus}
            onLogout={async () => {
              await supabase.auth.signOut();
              setCurrentView('home');
            }}
          />
        );

      default:
        return (
          <Home
            products={products}
            userName={userName}
            onProductClick={navigateToProduct}
            onLogout={handleLogout}
            cart={cart}
            onAddToCart={(product, qty) => addToCart(product, qty)}
            onUpdateQty={(id, delta) => {
              const item = cart.find(i => i.id === id && (!i.options || i.options.length === 0));
              if (item && item.cartId) {
                updateQuantity(item.cartId, delta);
              } else if (delta > 0) {
                const product = products.find(p => p.id === id);
                if (product) addToCart(product, 1);
              }
            }}
            storeStatus={storeStatus}
            isOpen={isOpen}
            onOpenInfo={() => setCurrentView('store_info')}
          />
        );

    }
  };

  const showNavbar = !['onboarding', 'login', 'product_detail', 'cart', 'checkout', 'settings', 'order_history', 'addresses', 'scheduling', 'payment_methods', 'editor', 'store_info', 'legal'].includes(currentView);

  return (
    <div className={`flex flex-col min-h-screen ${currentView === 'editor' ? 'w-full' : 'max-w-md md:max-w-4xl mx-auto'} relative shadow-2xl bg-dark-bg transition-all duration-500`}>
      <main className="flex-1 overflow-visible">
        {renderView()}
      </main>
      {showNavbar && (
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onLogout={handleLogout}
        />
      )}
      {cart.length > 0 && (
        <WhatsAppMovable />
      )}
    </div>
  );
};

const WhatsAppMovable: React.FC = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLAnchorElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (dragRef.current) {
      dragRef.current.setPointerCapture(e.pointerId);
      const rect = dragRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      // Garantir que fique dentro da tela
      const newX = Math.min(Math.max(20, e.clientX - offset.current.x), window.innerWidth - 80);
      const newY = Math.min(Math.max(20, e.clientY - offset.current.y), window.innerHeight - 80);
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <a
      ref={dragRef}
      href={`https://wa.me/5521972724360?text=${encodeURIComponent("Olá, vim do app OE Burguer's")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      style={{
        left: position.x,
        top: position.y,
        position: 'fixed',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => {
        if (isDragging) e.preventDefault(); // Evita abrir link se estiver apenas arrastando
      }}
    >
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
};

export default App;

