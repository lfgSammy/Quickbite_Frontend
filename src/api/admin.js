import client from './client';

export function createMenuItem(data) {
  return client.post('/menu/menu/', data).then((res) => res.data);
}

export function updateMenuItem(id, data) {
  return client.patch(`/menu/menu/${id}/`, data).then((res) => res.data);
}

export function deleteMenuItem(id) {
  return client.delete(`/menu/menu/${id}/`).then((res) => res.data);
}

export function createMenuItemSize(menuItemId, data) {
  return client
    .post(`/menu/menu/${menuItemId}/sizes/`, data)
    .then((res) => res.data);
}

export function updateMenuItemSize(id, data) {
  return client.patch(`/menu/sizes/${id}/`, data).then((res) => res.data);
}

export function deleteMenuItemSize(id) {
  return client.delete(`/menu/sizes/${id}/`).then((res) => res.data);
}

export function createShawarmaOption(menuItemId, data) {
  return client
    .post(`/menu/menu/${menuItemId}/shawarma-options/`, data)
    .then((res) => res.data);
}

export function updateShawarmaOption(id, data) {
  return client.patch(`/menu/shawarma-options/${id}/`, data).then((res) => res.data);
}

export function deleteShawarmaOption(id) {
  return client.delete(`/menu/shawarma-options/${id}/`).then((res) => res.data);
}

export function createRiceType(data) {
  return client.post('/menu/rice-types/', data).then((res) => res.data);
}

export function updateRiceType(id, data) {
  return client.patch(`/menu/rice-types/${id}/`, data).then((res) => res.data);
}

export function deleteRiceType(id) {
  return client.delete(`/menu/rice-types/${id}/`).then((res) => res.data);
}

export function createRiceExtra(data) {
  return client.post('/menu/rice-extras/', data).then((res) => res.data);
}

export function updateRiceExtra(id, data) {
  return client.patch(`/menu/rice-extras/${id}/`, data).then((res) => res.data);
}

export function deleteRiceExtra(id) {
  return client.delete(`/menu/rice-extras/${id}/`).then((res) => res.data);
}

export function createShawarmaExtra(data) {
  return client.post('/menu/shawarma-extras/', data).then((res) => res.data);
}

export function updateShawarmaExtra(id, data) {
  return client.patch(`/menu/shawarma-extras/${id}/`, data).then((res) => res.data);
}

export function deleteShawarmaExtra(id) {
  return client.delete(`/menu/shawarma-extras/${id}/`).then((res) => res.data);
}

export function createDrink(data) {
  return client.post('/menu/drinks/', data).then((res) => res.data);
}

export function updateDrink(id, data) {
  return client.patch(`/menu/drinks/${id}/`, data).then((res) => res.data);
}

export function deleteDrink(id) {
  return client.delete(`/menu/drinks/${id}/`).then((res) => res.data);
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
