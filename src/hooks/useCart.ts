import { useState, useEffect } from 'react';
import { CartItem } from '../../types';

const CART_KEY = 'oe_cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (product, quantity = 1, options: string[] = []) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.options || []) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const newPrev = [...prev];
        const item = newPrev[existingIndex];
        newPrev[existingIndex] = { ...item, quantity: item.quantity + quantity };
        return newPrev;
      }

      const addonsTotal = options.reduce((acc, opt) => optPrice(opt) ? acc + optPrice(opt) : acc, 0);
      const cartId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return [
        ...prev,
        { ...product, quantity, options, cartId, price: product.price + addonsTotal }
      ];
    });
  };

  const optPrice = (opt: string) => {
    // Placeholder: fetch price from productAddons or constants
    return 0;
  };

  const removeItem = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.cartId === cartId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  };

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};