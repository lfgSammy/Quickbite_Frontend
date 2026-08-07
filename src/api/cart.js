import client from './client';

export function getCart() {
  return client.get('/order/cart/').then((res) => res.data);
}

export function clearCart() {
  return client.delete('/order/cart/').then((res) => res.data);
}

export function addCartItem(payload) {
  return client.post('/order/cart/items/', payload).then((res) => res.data);
}

export function removeCartItem(itemId) {
  return client.delete(`/order/cart/items/${itemId}/`).then((res) => res.data);
}

export function updateCartItem(itemId, payload) {
  return client
    .patch(`/order/cart/items/${itemId}/update/`, payload)
    .then((res) => res.data);
}
