import { useEffect, useState } from 'react';
import { productosApi, mensajeError } from '../services/api.js';
import { StockBadge } from './StockAlerts.jsx';
import ProductModal from './ProductModal.jsx';

export default function InventoryTable({ refresco, onCambio }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'nuevo' | objeto producto

  const cargar = () =>
    productosApi
      .listar({ q: busqueda || undefined })
      .then(setProductos)
      .catch((e) => setError(mensajeError(e)));

  useEffect(() => {
    cargar();
  }, [busqueda, refresco]);

  const guardar = async (data) => {
    try {
      if (modal === 'nuevo') await productosApi.crear(data);
      else await productosApi.actualizar(modal.id, data);
    } catch (e) {
      throw mensajeError(e);
    }
    setModal(null);
    onCambio();
  };

  const baja = async (p) => {
    if (!window.confirm(`¿Dar de baja "${p.nombre}"?`)) return;
    try {
      await productosApi.darDeBaja(p.id);
      onCambio();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <section className="card">
      <div className="barra">
        <h2>Inventario</h2>
        <input
          className="buscador"
          placeholder="Buscar por nombre o categoría…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn" onClick={() => setModal('nuevo')}>+ Agregar producto</button>
      </div>

      {error && <p className="msg msg--error">{error}</p>}

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className={p.stock_actual <= p.stock_minimo ? 'fila-alerta' : ''}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>S/ {p.precio.toFixed(2)}</td>
                <td><strong>{p.stock_actual}</strong></td>
                <td>{p.stock_minimo}</td>
                <td><StockBadge producto={p} /></td>
                <td className="acciones">
                  <button className="btn btn--chico" onClick={() => setModal(p)}>Editar</button>
                  <button className="btn btn--chico btn--rojo" onClick={() => baja(p)}>Baja</button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td colSpan="7" className="vacio">No hay productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ProductModal
          producto={modal === 'nuevo' ? null : modal}
          onGuardar={guardar}
          onCerrar={() => setModal(null)}
        />
      )}
    </section>
  );
}
