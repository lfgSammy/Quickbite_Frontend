import client, { unwrapList } from './client';

export function createMenuItem(data) {
  return client.post('/menu/', data).then((res) => res.data);
}

export function updateMenuItem(id, data) {
  return client.patch(`/menu/${id}/`, data).then((res) => res.data);
}

export function deleteMenuItem(id) {
  return client.delete(`/menu/${id}/`).then((res) => res.data);
}

export function createMenuItemSize(menuItemId, data) {
  return client
    .post(`/menu/${menuItemId}/sizes/`, data)
    .then((res) => res.data);
}

export function updateMenuItemSize(id, data) {
  return client.patch(`/sizes/${id}/`, data).then((res) => res.data);
}

export function deleteMenuItemSize(id) {
  return client.delete(`/sizes/${id}/`).then((res) => res.data);
}

export function createShawarmaOption(menuItemId, data) {
  return client
    .post(`/menu/${menuItemId}/shawarma-options/`, data)
    .then((res) => res.data);
}

export function updateShawarmaOption(id, data) {
  return client.patch(`/shawarma-options/${id}/`, data).then((res) => res.data);
}

export function deleteShawarmaOption(id) {
  return client.delete(`/shawarma-options/${id}/`).then((res) => res.data);
}

export function createRiceType(data) {
  return client.post('/rice-types/', data).then((res) => res.data);
}

export function updateRiceType(id, data) {
  return client.patch(`/rice-types/${id}/`, data).then((res) => res.data);
}

export function deleteRiceType(id) {
  return client.delete(`/rice-types/${id}/`).then((res) => res.data);
}

export function createRiceExtra(data) {
  return client.post('/rice-extras/', data).then((res) => res.data);
}

export function updateRiceExtra(id, data) {
  return client.patch(`/rice-extras/${id}/`, data).then((res) => res.data);
}

export function deleteRiceExtra(id) {
  return client.delete(`/rice-extras/${id}/`).then((res) => res.data);
}

export function createShawarmaExtra(data) {
  return client.post('/shawarma-extras/', data).then((res) => res.data);
}

export function updateShawarmaExtra(id, data) {
  return client.patch(`/shawarma-extras/${id}/`, data).then((res) => res.data);
}

export function deleteShawarmaExtra(id) {
  return client.delete(`/shawarma-extras/${id}/`).then((res) => res.data);
}

export function createDrink(data) {
  return client.post('/drinks/', data).then((res) => res.data);
}

export function updateDrink(id, data) {
  return client.patch(`/drinks/${id}/`, data).then((res) => res.data);
}

export function deleteDrink(id) {
  return client.delete(`/drinks/${id}/`).then((res) => res.data);
}

export function getDashboard() {
  return client.get('/admin/dashboard/').then((res) => res.data);
}

export function getUsers(params = {}) {
  return client.get('/users/', { params }).then((res) => unwrapList(res.data));
}

export function assignRole(userId, role) {
  return client
    .patch(`/users/${userId}/assign-role/`, { role })
    .then((res) => res.data);
}

export function setOperatingHours(data) {
  return client.post('/restaurant/hours/', data).then((res) => res.data);
}
