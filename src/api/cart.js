import client from './client';

export function getCart() {
  return client.get('/cart/').then((res) => res.data);
}

export function clearCart() {
  return client.delete('/cart/').then((res) => res.data);
}

export function addCartItem(payload) {
  return client.post('/cart/items/', payload).then((res) => res.data);
}

export function removeCartItem(itemId) {
  return client.delete(`/cart/items/${itemId}/`).then((res) => res.data);
}

export function updateCartItem(itemId, payload) {
  return client
    .patch(`/cart/items/${itemId}/update/`, payload)
    .then((res) => res.data);
}
