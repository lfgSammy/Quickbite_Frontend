import client from './client';

export function getMenuItems() {
  return client.get('/menu/').then((res) => res.data);
}

export function getMenuItem(id) {
  return client.get(`/menu/${id}/`).then((res) => res.data);
}

export function getRiceTypes() {
  return client.get('/rice-types/').then((res) => res.data);
}

export function getRiceExtras() {
  return client.get('/rice-extras/').then((res) => res.data);
}

export function getShawarmaExtras() {
  return client.get('/shawarma-extras/').then((res) => res.data);
}

export function getDrinks() {
  return client.get('/drinks/').then((res) => res.data);
}
