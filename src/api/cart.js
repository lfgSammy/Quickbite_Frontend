import client, { rememberCart, clearCartToken } from './client';

export function getCart() {
  return client.get('/cart/').then((res) => rememberCart(res.data));
}

export function clearCart() {
  return client.delete('/cart/').then((res) => res.data);
}

export function addCartItem(payload) {
  return client.post('/cart/items/', payload).then((res) => rememberCart(res.data));
}

export function removeCartItem(itemId) {
  return client.delete(`/cart/items/${itemId}/`).then((res) => res.data);
}

export function updateCartItem(itemId, payload) {
  return client
    .patch(`/cart/items/${itemId}/update/`, payload)
    .then((res) => rememberCart(res.data));
}

// Called once after login or registration: hands whatever the guest built to
// the account they just signed into, then retires the guest token.
export function claimCart() {
  const token = localStorage.getItem('cart_token');
  if (!token) return Promise.resolve(null);
  return client
    .post('/cart/claim/', { token })
    .then((res) => {
      clearCartToken();
      return res.data;
    })
    .catch(() => {
      clearCartToken();
      return null;
    });
}
