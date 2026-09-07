import client from './client';

export function initializePayment(orderId) {
  return client
    .post('/payments/initialize/', { order_id: orderId })
    .then((res) => res.data);
}

export function verifyPayment(reference) {
  return client
    .post('/payments/verify/', { reference })
    .then((res) => res.data);
}
