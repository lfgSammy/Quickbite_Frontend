import client from './client';

export function verifyQrCode(qrCode) {
  return client
    .post('/orders/verify-qr/', { qr_code: qrCode })
    .then((res) => res.data);
}

export function updateOrderStatus(orderId, orderStatus) {
  return client
    .patch(`/orders/${orderId}/`, { status: orderStatus })
    .then((res) => res.data);
}
