# Botica Nova Salud

Sistema web de gestión de inventario y ventas para una botica.
Frontend (React + Vite) y backend (Node.js + Express + MySQL) **separados**; el frontend consume la API REST.

## Estructura

```
botica-nova-salud/
├── backend/        API REST (Express + mysql2)
│   └── src/ server.js, db.js, routes/productos.js, routes/ventas.js
├── frontend/       React + Vite
│   └── src/ components/ (Navbar, Dashboard, InventoryTable, ProductModal, SalesPOS, StockAlerts), services/api.js
├── database/       botica_nova_salud.sql (tablas + datos de prueba)
├── GUIA_GIT.md     comandos de Git / GitHub / Pull Request
└── README.md
```

## Puesta en marcha

### 1. Base de datos
Con MySQL/MariaDB encendido (XAMPP usa el puerto 3306 o 3307 según tu instalación):

```bash
mysql -u root -P 3307 -h 127.0.0.1 < database/botica_nova_salud.sql
```
(o importa el archivo desde phpMyAdmin / MySQL Workbench).

### 2. Backend
```bash
cd backend
cp .env.example .env      # ajusta DB_PORT (3307) y DB_PASSWORD
npm install
npm run dev               # http://localhost:3000
```
Prueba: http://localhost:3000/api/health y http://localhost:3000/api/productos

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos?q=&categoria=` | Lista productos activos (búsqueda opcional) |
| GET | `/api/productos/alertas` | Productos con stock_actual <= stock_minimo |
| GET | `/api/productos/categorias` | Categorías disponibles |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Editar producto |
| DELETE | `/api/productos/:id` | Baja lógica (activo = 0) |
| POST | `/api/ventas` | Registrar venta `{ items: [{ producto_id, cantidad }] }` |
| GET | `/api/ventas` | Historial de ventas |
| GET | `/api/ventas/:id` | Detalle de una venta |
| GET | `/api/ventas/resumen` | KPIs del dashboard |

## Decisiones técnicas
- **Venta transaccional**: `POST /api/ventas` valida stock con `SELECT ... FOR UPDATE`, descuenta y guarda venta + detalle en una transacción; si algo falla, hace rollback.
- **Precio calculado en el servidor**: el frontend solo envía `producto_id` y `cantidad`, evitando manipulación de precios.
- **Baja lógica** de productos para conservar el historial de ventas.
- **Alertas de stock bajo**: badge rojo cuando `stock_actual <= stock_minimo` (inventario, POS y dashboard).
- **Seguridad básica**: consultas parametrizadas (previene inyección SQL), validación de entradas, CORS configurable y credenciales en `.env`.

## Mejoras posibles
Autenticación con JWT y roles, reportes por fecha, control de lotes y fechas de vencimiento, despliegue con Docker.
