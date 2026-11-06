import { useEffect, useState } from 'react';
import { ventasApi, mensajeError } from '../services/api.js';
import StockAlerts from './StockAlerts.jsx';

export default function Dashboard({ refresco, onIrAVentas }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ventasApi.resumen().then(setResumen).catch((e) => setError(mensajeError(e)));
  }, [refresco]);

  return (
    <>
      <div className="hero">
        <div>
          <h1>Atención en mostrador</h1>
          <p>Registra ventas rápido y mantén el stock bajo control.</p>
        </div>
        <button className="btn btn--grande" onClick={onIrAVentas}>
          Nueva venta →
        </button>
      </div>

      {error && <p className="msg msg--error">{error}</p>}

      {resumen && (
        <div className="kpis">
          <div className="kpi">
            <span>Ventas de hoy</span>
            <strong>{resumen.ventas_hoy}</strong>
          </div>
          <div className="kpi">
            <span>Total vendido hoy</span>
            <strong>S/ {resumen.total_hoy.toFixed(2)}</strong>
          </div>
          <div className="kpi">
            <span>Productos activos</span>
            <strong>{resumen.productos}</strong>
          </div>
          <div className={`kpi ${resumen.bajo_stock > 0 ? 'kpi--alerta' : ''}`}>
            <span>Con stock bajo</span>
            <strong>{resumen.bajo_stock}</strong>
          </div>
        </div>
      )}

      <StockAlerts refresco={refresco} />
    </>
  );
}
