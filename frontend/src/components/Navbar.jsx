const OPCIONES = [
  { id: 'dashboard', texto: 'Inicio' },
  { id: 'pos', texto: 'Punto de Venta' },
  { id: 'inventario', texto: 'Inventario' },
];

export default function Navbar({ vista, onChange }) {
  return (
    <header className="navbar">
      <div className="navbar__marca">
        <span className="navbar__cruz">✚</span> Botica Nova Salud
      </div>
      <nav className="navbar__menu">
        {OPCIONES.map((o) => (
          <button
            key={o.id}
            className={`navbar__link ${vista === o.id ? 'activo' : ''}`}
            onClick={() => onChange(o.id)}
          >
            {o.texto}
          </button>
        ))}
      </nav>
    </header>
  );
}
