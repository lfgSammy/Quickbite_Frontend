import client from './client';

export function getOrders() {
  return client.get('/order/orders/').then((res) => res.data);
}

export function getOrder(orderId) {
  return client.get(`/order/orders/${orderId}/`).then((res) => res.data);
}

export function createOrder(payload) {
  return client.post('/order/orders/', payload).then((res) => res.data);
}

export function cancelOrder(orderId) {
  return client
    .patch(`/order/orders/${orderId}/cancel/`)
    .then((res) => res.data);
}

export function revertOrderToCart(orderId) {
  return client
    .post(`/order/orders/${orderId}/revert/`)
    .then((res) => res.data);
}
