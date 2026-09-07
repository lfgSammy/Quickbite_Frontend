import client, { unwrapList } from './client';

export function getOrders() {
  return client.get('/orders/').then((res) => unwrapList(res.data));
}

export function getOrder(orderId) {
  return client.get(`/orders/${orderId}/`).then((res) => res.data);
}

export function createOrder(payload) {
  return client.post('/orders/', payload).then((res) => res.data);
}

export function cancelOrder(orderId) {
  return client
    .patch(`/orders/${orderId}/cancel/`)
    .then((res) => res.data);
}

export function revertOrderToCart(orderId) {
  return client
    .post(`/orders/${orderId}/revert/`)
    .then((res) => res.data);
}
