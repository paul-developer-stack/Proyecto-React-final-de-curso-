# Guía de Control de Versiones (Git + GitHub) - Botica Nova Salud

## 1. Inicializar el repositorio (en la carpeta raíz del proyecto)

```bash
cd botica-nova-salud
git init
git branch -M main
git config user.name "Tu Nombre"
git config user.email "tucorreo@gmail.com"
```

## 2. Primer commit en `main`

```bash
git add .gitignore README.md GUIA_GIT.md
git commit -m "chore: estructura inicial del proyecto y documentación"
```

## 3. Crear la rama `develop`

```bash
git checkout -b develop
```

## 4. Commits organizados (uno por módulo)

```bash
git add database/
git commit -m "feat(db): script SQL con tablas productos, ventas y detalle_ventas"

git add backend/
git commit -m "feat(backend): API REST Express con endpoints de productos y ventas"

git add frontend/src/services frontend/package.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/.env.example
git commit -m "feat(frontend): configuración de Vite y servicio axios"

git add frontend/src/components/InventoryTable.jsx frontend/src/components/ProductModal.jsx
git commit -m "feat(frontend): CRUD de inventario con modal"

git add frontend/src/components/SalesPOS.jsx
git commit -m "feat(frontend): punto de venta con carrito"

git add frontend/src/components/StockAlerts.jsx frontend/src/components/Dashboard.jsx frontend/src/components/Navbar.jsx frontend/src/App.jsx frontend/src/index.css
git commit -m "feat(frontend): dashboard, alertas de stock bajo y navegación"
```

## 5. Subir a GitHub

Crea un repositorio vacío en GitHub (sin README) y luego:

```bash
git remote add origin https://github.com/TU_USUARIO/botica-nova-salud.git
git push -u origin main
git push -u origin develop
```

## 6. Simular un Pull Request hacia `main`

Trabaja en una rama de funcionalidad desde `develop`:

```bash
git checkout develop
git checkout -b feature/reporte-ventas
# ... haces un cambio, por ejemplo en el README ...
git add .
git commit -m "feat: agrega reporte de ventas al README"
git push -u origin feature/reporte-ventas
```

En GitHub:
1. Pulsa **Compare & pull request** → base: `develop` ← compare: `feature/reporte-ventas`.
2. Revisa los cambios, escribe la descripción y pulsa **Merge pull request**.

Luego, el PR de la entrega final (`develop` → `main`):

```bash
git checkout develop
git pull origin develop
git push origin develop
```

En GitHub: **New pull request** → base: `main` ← compare: `develop` → título "Release v1.0 - Botica Nova Salud" → **Merge pull request**.

Actualiza tu copia local:

```bash
git checkout main
git pull origin main
git tag v1.0
git push origin v1.0
```

## 7. Ver el historial (para capturas del informe)

```bash
git log --oneline --graph --all
```
