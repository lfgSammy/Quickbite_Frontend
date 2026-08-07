import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(payload) {
    const data = await cartApi.addCartItem(payload);
    setCart(data);
    return data;
  }

  async function updateItem(itemId, payload) {
    const data = await cartApi.updateCartItem(itemId, payload);
    setCart(data);
    return data;
  }

  async function removeItem(itemId) {
    await cartApi.removeCartItem(itemId);
    await refreshCart();
  }

  async function clear() {
    await cartApi.clearCart();
    setCart(null);
    await refreshCart();
  }

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    itemCount,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
