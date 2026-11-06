const express = require('express');
const pool = require('../db');
const router = express.Router();

const httpError = (status, message) => Object.assign(new Error(message), { status });

function validar(body) {
  const { nombre, categoria, precio, stock_actual, stock_minimo } = body;
  if (!nombre || !String(nombre).trim()) return 'El nombre es obligatorio';
  if (!categoria || !String(categoria).trim()) return 'La categoría es obligatoria';
  if (!(Number(precio) >= 0)) return 'El precio debe ser un número mayor o igual a 0';
  if (!Number.isInteger(Number(stock_actual)) || Number(stock_actual) < 0) return 'Stock actual inválido';
  if (!Number.isInteger(Number(stock_minimo)) || Number(stock_minimo) < 0) return 'Stock mínimo inválido';
  return null;
}

// GET /api/productos?q=texto&categoria=X
router.get('/', async (req, res, next) => {
  try {
    const { q, categoria } = req.query;
    let sql = 'SELECT * FROM productos WHERE activo = 1';
    const params = [];
    if (q) { sql += ' AND (nombre LIKE ? OR categoria LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
    sql += ' ORDER BY nombre';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/productos/alertas  -> stock_actual <= stock_minimo
router.get('/alertas', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE activo = 1 AND stock_actual <= stock_minimo ORDER BY stock_actual ASC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/productos/categorias
router.get('/categorias', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT categoria FROM productos WHERE activo = 1 ORDER BY categoria');
    res.json(rows.map((r) => r.categoria));
  } catch (e) { next(e); }
});

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ? AND activo = 1', [req.params.id]);
    if (!rows.length) throw httpError(404, 'Producto no encontrado');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/productos
router.post('/', async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) throw httpError(400, error);
    const { nombre, categoria, precio, stock_actual, stock_minimo } = req.body;
    const [r] = await pool.query(
      'INSERT INTO productos (nombre, categoria, precio, stock_actual, stock_minimo) VALUES (?,?,?,?,?)',
      [nombre.trim(), categoria.trim(), precio, stock_actual, stock_minimo]
    );
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const error = validar(req.body);
    if (error) throw httpError(400, error);
    const { nombre, categoria, precio, stock_actual, stock_minimo } = req.body;
    const [r] = await pool.query(
      `UPDATE productos SET nombre=?, categoria=?, precio=?, stock_actual=?, stock_minimo=?
       WHERE id=? AND activo=1`,
      [nombre.trim(), categoria.trim(), precio, stock_actual, stock_minimo, req.params.id]
    );
    if (!r.affectedRows) throw httpError(404, 'Producto no encontrado');
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// DELETE /api/productos/:id  -> baja lógica (conserva historial de ventas)
router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('UPDATE productos SET activo = 0 WHERE id = ? AND activo = 1', [req.params.id]);
    if (!r.affectedRows) throw httpError(404, 'Producto no encontrado');
    res.json({ message: 'Producto dado de baja' });
  } catch (e) { next(e); }
});

module.exports = router;
