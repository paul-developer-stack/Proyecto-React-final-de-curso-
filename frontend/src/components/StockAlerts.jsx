import { useEffect, useState } from 'react';
import { productosApi, mensajeError } from '../services/api.js';

// Badge reutilizable: rojo si stock_actual <= stock_minimo
export function StockBadge({ producto }) {
  const bajo = producto.stock_actual <= producto.stock_minimo;
  return (
    <span className={`badge ${bajo ? 'badge--rojo' : 'badge--verde'}`}>
      {bajo ? '⚠ Stock bajo' : 'OK'}
    </span>
  );
}

export default function StockAlerts({ refresco }) {
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    productosApi.alertas().then(setAlertas).catch((e) => setError(mensajeError(e)));
  }, [refresco]);

  if (error) return <p className="msg msg--error">{error}</p>;

  return (
    <section className="card">
      <h2>Alertas de reposición</h2>
      {alertas.length === 0 ? (
        <p className="msg msg--ok">Todo el inventario está por encima del stock mínimo.</p>
      ) : (
        <ul className="alertas">
          {alertas.map((p) => (
            <li key={p.id} className="alertas__item">
              <div>
                <strong>{p.nombre}</strong>
                <small>{p.categoria}</small>
              </div>
              <span className="badge badge--rojo">
                {p.stock_actual} / mín. {p.stock_minimo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
