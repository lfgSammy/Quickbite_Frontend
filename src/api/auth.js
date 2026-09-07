import client, { unwrapList } from './client';

export function register(data) {
  return client.post('/auth/register/', data).then((res) => res.data);
}

export function login(data) {
  return client.post('/auth/login/', data).then((res) => res.data);
}

export function googleAuth(data) {
  return client.post('/auth/google/', data).then((res) => res.data);
}

export function forgotPassword(data) {
  return client.post('/auth/forgot-password/', data).then((res) => res.data);
}

export function verifyResetOtp(data) {
  return client.post('/auth/verify-reset-otp/', data).then((res) => res.data);
}

export function resetPassword(data) {
  return client.post('/auth/reset-password/', data).then((res) => res.data);
}

export function getProfile() {
  return client.get('/auth/profile/').then((res) => res.data);
}

export function updateProfile(data) {
  return client.patch('/auth/profile/', data).then((res) => res.data);
}

export function getRestaurantStatus() {
  return client.get('/restaurant/status/').then((res) => res.data);
}

export function getOperatingHours() {
  return client.get('/restaurant/hours/').then((res) => res.data);
}

export function getNotifications() {
  return client.get('/notifications/').then((res) => unwrapList(res.data));
}

export function markNotificationsRead() {
  return client.patch('/notifications/').then((res) => res.data);
}
