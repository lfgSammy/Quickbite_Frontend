import client from './client';

export function getMenuItems() {
  return client.get('/menu/menu/').then((res) => res.data);
}

export function getMenuItem(id) {
  return client.get(`/menu/menu/${id}/`).then((res) => res.data);
}

export function getRiceTypes() {
  return client.get('/menu/rice-types/').then((res) => res.data);
}

export function getRiceExtras() {
  return client.get('/menu/rice-extras/').then((res) => res.data);
}

export function getShawarmaExtras() {
  return client.get('/menu/shawarma-extras/').then((res) => res.data);
}

export function getDrinks() {
  return client.get('/menu/drinks/').then((res) => res.data);
}
