import { useState } from 'react';

const VACIO = { nombre: '', categoria: '', precio: '', stock_actual: 0, stock_minimo: 5 };

export default function ProductModal({ producto, onGuardar, onCerrar }) {
  const [form, setForm] = useState(producto ? { ...producto } : VACIO);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onGuardar({
        nombre: form.nombre,
        categoria: form.categoria,
        precio: Number(form.precio),
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
      });
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2>{producto ? 'Editar producto' : 'Nuevo producto'}</h2>

        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} required autoFocus />
        </label>
        <label>
          Categoría
          <input name="categoria" value={form.categoria} onChange={cambiar} required />
        </label>
        <div className="fila">
          <label>
            Precio (S/)
            <input name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={cambiar} required />
          </label>
          <label>
            Stock actual
            <input name="stock_actual" type="number" min="0" value={form.stock_actual} onChange={cambiar} required />
          </label>
          <label>
            Stock mínimo
            <input name="stock_minimo" type="number" min="0" value={form.stock_minimo} onChange={cambiar} required />
          </label>
        </div>

        {error && <p className="msg msg--error">{error}</p>}

        <div className="modal__acciones">
          <button type="button" className="btn btn--gris" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
