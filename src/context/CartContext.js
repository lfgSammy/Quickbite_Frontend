import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Loaded for everyone: a guest's cart is real, it is just addressed by a
  // token rather than an account.
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // Now that this runs for guests too it fires on every page load, so a
      // failure here (offline, server down) must not become an unhandled
      // rejection. An unloadable cart just reads as empty; the rest of the
      // app still works.
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Signing in hands the guest cart to the account, so nothing chosen while
  // signed out is lost.
  // Held under `loading` on purpose. Checkout reads the cart straight after
  // login, but the order is built from the *account's* cart server-side - so
  // between signing in and the claim landing there is a window where the page
  // shows the guest's items while the server still sees an empty cart, and
  // placing the order fails. Consumers already wait on `loading`, so this
  // keeps them waiting until the handover is real.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;

    setLoading(true);
    cartApi
      .claimCart()
      .then(async (claimed) => {
        if (cancelled) return;
        if (claimed) setCart(claimed);
        else await refreshCart();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshCart]);

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

  const itemCount = cart?.items?.length || 0;

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
