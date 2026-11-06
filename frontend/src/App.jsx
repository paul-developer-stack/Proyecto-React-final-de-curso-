import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import InventoryTable from './components/InventoryTable.jsx';
import SalesPOS from './components/SalesPOS.jsx';

export default function App() {
  const [vista, setVista] = useState('dashboard');
  // Se incrementa cada vez que cambia el stock para que los demás módulos recarguen
  const [refresco, setRefresco] = useState(0);
  const refrescar = () => setRefresco((n) => n + 1);

  return (
    <>
      <Navbar vista={vista} onChange={setVista} />
      <main className="container">
        {vista === 'dashboard' && <Dashboard refresco={refresco} onIrAVentas={() => setVista('pos')} />}
        {vista === 'inventario' && <InventoryTable refresco={refresco} onCambio={refrescar} />}
        {vista === 'pos' && <SalesPOS onVentaRegistrada={refrescar} />}
      </main>
    </>
  );
}
