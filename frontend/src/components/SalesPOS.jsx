import { useEffect, useMemo, useState } from 'react';
import { productosApi, ventasApi, mensajeError } from '../services/api.js';

export default function SalesPOS({ onVentaRegistrada }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]); // [{ producto, cantidad }]
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }
  const [procesando, setProcesando] = useState(false);

  const cargar = () =>
    productosApi
      .listar({ q: busqueda || undefined, categoria: categoria || undefined })
      .then(setProductos)
      .catch((e) => setMensaje({ tipo: 'error', texto: mensajeError(e) }));

  useEffect(() => {
    productosApi.categorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    cargar();
  }, [busqueda, categoria]);

  const total = useMemo(
    () => carrito.reduce((acc, l) => acc + l.producto.precio * l.cantidad, 0),
    [carrito]
  );

  const agregar = (p) => {
    setMensaje(null);
    setCarrito((c) => {
      const existe = c.find((l) => l.producto.id === p.id);
      if (existe) {
        if (existe.cantidad >= p.stock_actual) return c; // no superar stock
        return c.map((l) => (l.producto.id === p.id ? { ...l, cantidad: l.cantidad + 1 } : l));
      }
      return [...c, { producto: p, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) =>
    setCarrito((c) =>
      c
        .map((l) => {
          if (l.producto.id !== id) return l;
          const nueva = Math.min(l.cantidad + delta, l.producto.stock_actual);
          return { ...l, cantidad: nueva };
        })
        .filter((l) => l.cantidad > 0)
    );

  const quitar = (id) => setCarrito((c) => c.filter((l) => l.producto.id !== id));

  const cobrar = async () => {
    setProcesando(true);
    setMensaje(null);
    try {
      const r = await ventasApi.registrar(
        carrito.map((l) => ({ producto_id: l.producto.id, cantidad: l.cantidad }))
      );
      setMensaje({ tipo: 'ok', texto: `Venta #${r.id} registrada. Total: S/ ${r.total.toFixed(2)}` });
      setCarrito([]);
      await cargar();
      onVentaRegistrada();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: mensajeError(e) });
      await cargar(); // el stock pudo haber cambiado
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="pos">
      <section className="card pos__catalogo">
        <div className="barra">
          <input
            className="buscador"
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoFocus
          />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid-productos">
          {productos.map((p) => {
            const agotado = p.stock_actual === 0;
            const bajo = p.stock_actual <= p.stock_minimo;
            return (
              <button
                key={p.id}
                className={`producto ${bajo ? 'producto--bajo' : ''}`}
                disabled={agotado}
                onClick={() => agregar(p)}
              >
                <strong>{p.nombre}</strong>
                <small>{p.categoria}</small>
                <span className="producto__precio">S/ {p.precio.toFixed(2)}</span>
                <span className={`badge ${bajo ? 'badge--rojo' : 'badge--verde'}`}>
                  {agotado ? 'Agotado' : `Stock: ${p.stock_actual}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="card pos__carrito">
        <h2>Carrito</h2>
        {carrito.length === 0 && <p className="vacio">Selecciona productos para vender.</p>}

        <ul className="carrito">
          {carrito.map(({ producto, cantidad }) => (
            <li key={producto.id} className="carrito__item">
              <div className="carrito__info">
                <strong>{producto.nombre}</strong>
                <small>S/ {producto.precio.toFixed(2)} c/u</small>
              </div>
              <div className="carrito__cant">
                <button onClick={() => cambiarCantidad(producto.id, -1)}>−</button>
                <span>{cantidad}</span>
                <button onClick={() => cambiarCantidad(producto.id, 1)}>+</button>
              </div>
              <div className="carrito__sub">S/ {(producto.precio * cantidad).toFixed(2)}</div>
              <button className="carrito__quitar" onClick={() => quitar(producto.id)}>✕</button>
            </li>
          ))}
        </ul>

        <div className="total">
          <span>Total</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        {mensaje && <p className={`msg msg--${mensaje.tipo}`}>{mensaje.texto}</p>}

        <button className="btn btn--grande btn--full" disabled={!carrito.length || procesando} onClick={cobrar}>
          {procesando ? 'Procesando…' : 'Cobrar y registrar venta'}
        </button>
      </aside>
    </div>
  );
}
