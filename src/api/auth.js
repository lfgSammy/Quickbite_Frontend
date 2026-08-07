import client from './client';

export function register(data) {
  return client.post('/user/auth/register/', data).then((res) => res.data);
}

export function login(data) {
  return client.post('/user/auth/login/', data).then((res) => res.data);
}

export function getProfile() {
  return client.get('/user/auth/profile/').then((res) => res.data);
}

export function updateProfile(data) {
  return client.patch('/user/auth/profile/', data).then((res) => res.data);
}

export function getRestaurantStatus() {
  return client.get('/user/restaurant/status/').then((res) => res.data);
}

export function getOperatingHours() {
  return client.get('/user/restaurant/hours/').then((res) => res.data);
}

export function getNotifications() {
  return client.get('/user/notifications/').then((res) => res.data);
}

export function markNotificationsRead() {
  return client.patch('/user/notifications/').then((res) => res.data);
}
