import client from './client';

export function createMenuItem(data) {
  return client.post('/menu/menu/', data).then((res) => res.data);
}

export function createMenuItemSize(menuItemId, data) {
  return client
    .post(`/menu/menu/${menuItemId}/sizes/`, data)
    .then((res) => res.data);
}

export function createShawarmaOption(menuItemId, data) {
  return client
    .post(`/menu/menu/${menuItemId}/shawarma-options/`, data)
    .then((res) => res.data);
}

export function createRiceType(data) {
  return client.post('/menu/rice-types/', data).then((res) => res.data);
}

export function createRiceExtra(data) {
  return client.post('/menu/rice-extras/', data).then((res) => res.data);
}

export function createShawarmaExtra(data) {
  return client.post('/menu/shawarma-extras/', data).then((res) => res.data);
}

export function createDrink(data) {
  return client.post('/menu/drinks/', data).then((res) => res.data);
}

export function getDashboard() {
  return client.get('/order/admin/dashboard/').then((res) => res.data);
}

export function getUsers(params = {}) {
  return client.get('/user/users/', { params }).then((res) => res.data);
}

export function assignRole(userId, role) {
  return client
    .patch(`/user/users/${userId}/assign-role/`, { role })
    .then((res) => res.data);
}

export function setOperatingHours(data) {
  return client.post('/user/restaurant/hours/', data).then((res) => res.data);
}
