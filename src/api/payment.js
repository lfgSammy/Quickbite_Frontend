import client from './client';

export function initializePayment(orderId) {
  return client
    .post('/payment/payments/initialize/', { order_id: orderId })
    .then((res) => res.data);
}

export function verifyPayment(reference) {
  return client
    .post('/payment/payments/verify/', { reference })
    .then((res) => res.data);
}
