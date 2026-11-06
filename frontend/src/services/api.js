import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Extrae el mensaje de error del backend para mostrarlo al usuario
export const mensajeError = (e) => e?.response?.data?.message || e.message || 'Error de conexión';

export const productosApi = {
  listar: (params = {}) => http.get('/productos', { params }).then((r) => r.data),
  alertas: () => http.get('/productos/alertas').then((r) => r.data),
  categorias: () => http.get('/productos/categorias').then((r) => r.data),
  crear: (data) => http.post('/productos', data).then((r) => r.data),
  actualizar: (id, data) => http.put(`/productos/${id}`, data).then((r) => r.data),
  darDeBaja: (id) => http.delete(`/productos/${id}`).then((r) => r.data),
};

export const ventasApi = {
  registrar: (items) => http.post('/ventas', { items }).then((r) => r.data),
  listar: () => http.get('/ventas').then((r) => r.data),
  resumen: () => http.get('/ventas/resumen').then((r) => r.data),
};
