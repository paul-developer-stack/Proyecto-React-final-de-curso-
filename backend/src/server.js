require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const productosRouter = require('./routes/productos');
const ventasRouter = require('./routes/ventas');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);

app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// Manejador de errores central
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Botica Nova Salud en http://localhost:${PORT}`));
