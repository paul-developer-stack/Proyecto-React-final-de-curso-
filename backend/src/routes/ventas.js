const express = require('express');
const pool = require('../db');
const router = express.Router();

const httpError = (status, message) => Object.assign(new Error(message), { status });

// GET /api/ventas  -> historial (últimas 100)
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC, id DESC LIMIT 100');
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/ventas/resumen -> datos para el dashboard
router.get('/resumen', async (_req, res, next) => {
  try {
    const [[hoy]] = await pool.query(
      'SELECT COUNT(*) AS cantidad, COALESCE(SUM(total),0) AS total FROM ventas WHERE DATE(fecha) = CURDATE()'
    );
    const [[prod]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(stock_actual <= stock_minimo) AS bajo_stock FROM productos WHERE activo = 1'
    );
    res.json({
      ventas_hoy: hoy.cantidad,
      total_hoy: Number(hoy.total),
      productos: prod.total,
      bajo_stock: Number(prod.bajo_stock || 0),
    });
  } catch (e) { next(e); }
});

// GET /api/ventas/:id -> detalle de una venta
router.get('/:id', async (req, res, next) => {
  try {
    const [v] = await pool.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
    if (!v.length) throw httpError(404, 'Venta no encontrada');
    const [items] = await pool.query(
      `SELECT d.*, p.nombre FROM detalle_ventas d
       JOIN productos p ON p.id = d.producto_id WHERE d.venta_id = ?`,
      [req.params.id]
    );
    res.json({ ...v[0], items });
  } catch (e) { next(e); }
});

// POST /api/ventas
// body: { items: [{ producto_id, cantidad }] }
// Transacción: valida stock, descuenta y registra venta + detalle.
router.post('/', async (req, res, next) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) return next(httpError(400, 'La venta no tiene productos'));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const lineas = [];

    for (const it of items) {
      const cantidad = Number(it.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) throw httpError(400, 'Cantidad inválida');

      // FOR UPDATE bloquea la fila para evitar ventas simultáneas con stock insuficiente
      const [rows] = await conn.query(
        'SELECT id, nombre, precio, stock_actual FROM productos WHERE id = ? AND activo = 1 FOR UPDATE',
        [it.producto_id]
      );
      if (!rows.length) throw httpError(404, `Producto ${it.producto_id} no existe`);
      const p = rows[0];
      if (p.stock_actual < cantidad) {
        throw httpError(409, `Stock insuficiente de "${p.nombre}" (disponible: ${p.stock_actual})`);
      }
      const subtotal = Math.round(p.precio * cantidad * 100) / 100;
      total += subtotal;
      lineas.push({ id: p.id, cantidad, precio: p.precio, subtotal });
    }

    total = Math.round(total * 100) / 100;
    const [v] = await conn.query('INSERT INTO ventas (total) VALUES (?)', [total]);

    for (const l of lineas) {
      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [v.insertId, l.id, l.cantidad, l.precio, l.subtotal]
      );
      await conn.query('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?', [l.cantidad, l.id]);
    }

    await conn.commit();
    res.status(201).json({ id: v.insertId, total, message: 'Venta registrada' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

module.exports = router;
