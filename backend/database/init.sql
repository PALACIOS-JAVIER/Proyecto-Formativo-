-- database/init.sql
-- Ejecutar en pgAdmin u otra herramienta de PostgreSQL

-- 1. Crear el rol / usuario
-- CREATE ROLE stimi WITH LOGIN PASSWORD 'stimi123';

-- 2. Crear base de datos
-- CREATE DATABASE proyecto_formativo OWNER stimi;

-- ==========================================
-- CONÉCTATE A LA BASE DE DATOS proyecto_formativo
-- Y EJECUTA EL RESTO DEL SCRIPT
-- ==========================================

CREATE TABLE sedes (
    id_sede SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_sede INT REFERENCES sedes(id_sede) ON DELETE CASCADE
);

CREATE TABLE areas (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_rol INT REFERENCES roles(id_rol) ON DELETE CASCADE
);

CREATE TABLE especialidades (
    id_especialidad SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_area INT REFERENCES areas(id_area) ON DELETE CASCADE
);

CREATE TABLE objetos_contractuales (
    id_objeto SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    id_area INT REFERENCES areas(id_area) ON DELETE CASCADE
);

CREATE TABLE usuarios (
    "id_Usuario" SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    apellido VARCHAR(200) NOT NULL,
    cedula BIGINT UNIQUE NOT NULL,
    telefono BIGINT UNIQUE NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    "codigoContrato" VARCHAR(255),
    "codigoSiif" INT,
    "fechaInicioContrato" DATE,
    "fechaFinContrato" DATE,
    password VARCHAR(255) NOT NULL,
    "fotoPerfil" VARCHAR(255),
    firma VARCHAR(255),
    estado_cuenta VARCHAR(50) DEFAULT 'pendiente',
    id_sede INT REFERENCES sedes(id_sede),
    id_rol INT REFERENCES roles(id_rol),
    id_area INT REFERENCES areas(id_area),
    id_especialidad INT REFERENCES especialidades(id_especialidad),
    id_objeto INT REFERENCES objetos_contractuales(id_objeto)
);

CREATE TABLE coordinadores (
    id_coordinador SERIAL PRIMARY KEY,
    anio_ejercicio INT NOT NULL DEFAULT 2026,
    id_usuario INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE,
    id_sede INT REFERENCES sedes(id_sede) ON DELETE CASCADE
);

CREATE TABLE apoyos_administrativos (
    id_apoyo SERIAL PRIMARY KEY,
    id_coordinador INT REFERENCES coordinadores(id_coordinador) ON DELETE CASCADE,
    id_usuario INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

CREATE TABLE coordinadores (
    id_coordinador SERIAL PRIMARY KEY,
    id_sede INT UNIQUE REFERENCES sedes(id_sede) ON DELETE CASCADE,
    id_usuario INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE,
    anio_ejercicio INT
);

CREATE TABLE apoyos_administrativos (
    id_apoyo SERIAL PRIMARY KEY,
    id_coordinador INT REFERENCES coordinadores(id_coordinador) ON DELETE CASCADE,
    id_usuario INT UNIQUE REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

CREATE TABLE campesena_obligaciones (
    id_obligacion SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE regular_fic_obligaciones (
    id_obligacion SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- NUEVOS MÓDULOS DE INFORMES SEPARADOS
-- ==========================================

CREATE TABLE informes_gc (
    id_informe_gc SERIAL PRIMARY KEY,
    mes VARCHAR(255) NOT NULL,
    anio INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'warning',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    archivo_url VARCHAR(255),
    id_usuario INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

CREATE TABLE observaciones_gc (
    id_observacion_gc SERIAL PRIMARY KEY,
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_informe_gc INT REFERENCES informes_gc(id_informe_gc) ON DELETE CASCADE,
    id_coordinador INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

CREATE TABLE informes_gf (
    id_informe_gf SERIAL PRIMARY KEY,
    mes VARCHAR(255) NOT NULL,
    anio INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'warning',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    archivo_url VARCHAR(255),
    id_usuario INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

CREATE TABLE observaciones_gf (
    id_observacion_gf SERIAL PRIMARY KEY,
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_informe_gf INT REFERENCES informes_gf(id_informe_gf) ON DELETE CASCADE,
    id_coordinador INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

-- ==========================================
-- NOTIFICACIONES Y HISTORIAL
-- ==========================================

CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_destino INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE,
    id_usuario_origen INT REFERENCES usuarios("id_Usuario") ON DELETE SET NULL
);

CREATE TABLE historial (
    id_historial SERIAL PRIMARY KEY,
    accion VARCHAR(255) NOT NULL,
    detalles TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_coordinador INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE,
    id_instructor INT REFERENCES usuarios("id_Usuario") ON DELETE CASCADE
);

-- ==========================================
-- DATOS INICIALES (SEMILLAS)
-- ==========================================


-- Insertar coordinador por defecto
INSERT INTO usuarios (nombre, apellido, cedula, telefono, correo, "codigoContrato", "codigoSiif", "fechaInicioContrato", "fechaFinContrato", password, estado_cuenta, id_sede, id_rol, id_area) 
VALUES ('Admin', 'Coordinador', 111111111, 3000000000, 'admin@sena.edu.co', NULL, NULL, NULL, NULL, '123456', 'aprobado', 1, 3, NULL);

-- Asignar coordinador a la sede Yamboro
INSERT INTO coordinadores (id_sede, id_usuario, anio_ejercicio) VALUES (1, 1, 2025);

-- Insertar instructor por defecto
INSERT INTO usuarios (nombre, apellido, cedula, telefono, correo, "codigoContrato", "codigoSiif", "fechaInicioContrato", "fechaFinContrato", password, estado_cuenta, id_sede, id_rol, id_area, id_especialidad) 
VALUES ('Instructor', 'Demo', 222222222, 3000000001, 'instructor@sena.edu.co', 'CTR-111', 1, '2025-01-01', '2025-12-31', '123456', 'aprobado', 1, 1, 1, 1);
