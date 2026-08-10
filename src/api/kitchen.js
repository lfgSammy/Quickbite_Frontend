import client from './client';

export function verifyQrCode(qrCode) {
  return client
    .post('/order/orders/verify-qr/', { qr_code: qrCode })
    .then((res) => res.data);
}

export function updateOrderStatus(orderId, orderStatus) {
  return client
    .patch(`/order/orders/${orderId}/`, { status: orderStatus })
    .then((res) => res.data);
}
