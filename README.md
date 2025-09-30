# Sistema de Monitoreo - Protección Civil Miranda

Sistema web para el monitoreo en tiempo real de unidades de respuesta del 0800 de Protección Civil del estado Miranda.

## Características

- ✅ Mapa interactivo del estado Miranda
- ✅ Gestión de unidades (agregar, editar, eliminar)
- ✅ Funcionamiento offline con Service Workers
- ✅ Sincronización automática al recuperar conexión
- ✅ Diseño responsive para móviles y tablets
- ✅ Autenticación segura
- ✅ Estadísticas en tiempo real

## Requisitos

- XAMPP (Apache, MySQL, PHP)
- Navegador web moderno
- Visual Studio Code (recomendado)

## Instalación Local

### 1. Configurar XAMPP

1. Descargar e instalar XAMPP desde https://www.apachefriends.org/
2. Iniciar Apache y MySQL desde el panel de control

### 2. Crear Base de Datos

1. Abrir http://localhost/phpmyadmin
2. Crear nueva base de datos: `proteccion_civil_db`
3. Ejecutar este SQL:

```sql
CREATE TABLE unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    tipo_unidad VARCHAR(50) NOT NULL,
    encargado VARCHAR(100) NOT NULL,
    tripulantes TEXT,
    estado ENUM('base', 'ruta', 'emergencia') DEFAULT 'base',
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos de ejemplo
INSERT INTO unidades (placa, tipo_unidad, encargado, tripulantes, estado) VALUES
('PC-MIR-001', 'Ambulancia', 'Carlos Pérez', 'María González,Juan Rodríguez', 'base'),
('PC-MIR-002', 'Rescate', 'Ana López', 'Pedro Martínez,Luis García', 'ruta'),
('PC-MIR-003', 'Bomberos', 'Roberto Silva', 'José Hernández,Carmen Díaz', 'emergencia');