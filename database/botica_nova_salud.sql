-- =====================================================
-- Botica Nova Salud - Script de base de datos
-- MySQL / MariaDB (puerto 3307 si usas XAMPP/MariaDB)
-- =====================================================
CREATE DATABASE IF NOT EXISTS botica_nova_salud
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE botica_nova_salud;

DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  categoria     VARCHAR(60)   NOT NULL,
  precio        DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  stock_actual  INT           NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo  INT           NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
  activo        TINYINT(1)    NOT NULL DEFAULT 1,  -- 0 = dado de baja (baja lógica)
  creado_en     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB;

CREATE TABLE ventas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  fecha     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  total     DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE detalle_ventas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  venta_id        INT           NOT NULL,
  producto_id     INT           NOT NULL,
  cantidad        INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id)    REFERENCES ventas(id)    ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- ---------- Datos de prueba ----------
INSERT INTO productos (nombre, categoria, precio, stock_actual, stock_minimo) VALUES
('Paracetamol 500 mg x 100 tab', 'Analgésicos',      12.50, 80, 20),
('Ibuprofeno 400 mg x 20 tab',   'Analgésicos',       8.90, 45, 15),
('Amoxicilina 500 mg x 21 cáps', 'Antibióticos',     25.00, 12, 10),
('Loratadina 10 mg x 10 tab',    'Antialérgicos',     5.50,  6, 10),
('Omeprazol 20 mg x 14 cáps',    'Gastrointestinal', 11.00, 30, 10),
('Vitamina C 1 g x 30 tab',      'Vitaminas',        18.00, 25,  8),
('Alcohol medicinal 96° 250 ml', 'Primeros auxilios', 6.00, 40, 12),
('Suero oral sabor fresa',       'Hidratación',       4.50,  3, 10),
('Jarabe para la tos 120 ml',    'Respiratorio',     14.00, 18,  8),
('Mascarilla KN95 (unidad)',     'Primeros auxilios', 2.50, 100, 30);

INSERT INTO ventas (total) VALUES (21.40);
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 12.50, 12.50),
(1, 2, 1,  8.90,  8.90);
