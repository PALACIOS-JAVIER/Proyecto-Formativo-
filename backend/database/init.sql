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

-- sedes
INSERT INTO sedes (id_sede, nombre) VALUES
(1, 'Yamboro') ON CONFLICT DO NOTHING;
SELECT setval('sedes_id_sede_seq', (SELECT MAX(id_sede) FROM sedes));

-- roles
INSERT INTO roles (id_rol, nombre, id_sede) VALUES
(1, 'Regular - Fic', 1),
(2, 'CampeSena', 1) ON CONFLICT DO NOTHING;
SELECT setval('roles_id_rol_seq', (SELECT MAX(id_rol) FROM roles));

-- areas
INSERT INTO areas (id_area, nombre, id_rol) VALUES
(1, 'Construcción', 1),
(2, 'Agricola', 1),
(3, 'Agropecuaria', 1),
(4, 'Ambiental', 1),
(5, 'Informatica', 1),
(6, 'Cocina', 1),
(7, 'Deportes', 1),
(8, 'Etica', 1),
(9, 'Comunicación', 1),
(10, 'Seguridad Y Salud En El Trabajo', 1),
(11, 'Emprendimiento', 1),
(12, 'Produccion Pecuaria', 2),
(13, 'Agricola', 2),
(14, 'Opereciones Forestales', 2),
(15, 'Comunicación', 2),
(16, 'Bilinguismo', 1),
(17, 'Idiomas', 2) ON CONFLICT DO NOTHING;
SELECT setval('areas_id_area_seq', (SELECT MAX(id_area) FROM areas));

-- especialidades
INSERT INTO especialidades (id_especialidad, nombre, id_area) VALUES
(1, 'Construccion y Afines', 1),
(2, 'Guadua', 1),
(3, 'Dibujo Arquitectonico', 1),
(4, 'Electricidad', 1),
(5, 'Topografia', 1),
(6, 'Afines del Instructor', 2),
(7, 'Biologo', 2),
(8, 'Afines del Instructor', 3),
(9, 'Afines del Instructor', 4),
(10, 'Software', 5),
(11, 'Afines del Instructor', 6),
(12, 'Multimedia', 5),
(13, 'Redes de datos', 5),
(14, 'Afines del Instructor', 7),
(15, 'Afines del Instructor', 8),
(16, 'Afines del Instructor', 9),
(17, 'Afines del Instructor', 10),
(18, 'Quimica', 4),
(19, 'Afines del Instructor', 11),
(20, 'Afines del Instructor', 12),
(21, 'Produccion de Cafes', 13),
(22, 'Afines del Instructor', 14),
(23, 'Afines del CGDSS', 15),
(24, 'Cultivos Agricolas', 13),
(25, 'Ingles', 16),
(26, 'Ingles', 17),
(27, 'Afines del Instructor', 5) ON CONFLICT DO NOTHING;
SELECT setval('especialidades_id_especialidad_seq', (SELECT MAX(id_especialidad) FROM especialidades));

-- objetos_contractuales
INSERT INTO objetos_contractuales (id_objeto, descripcion, id_area) VALUES
(1, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN y/o afines al perfil de instructor.', 1),
(2, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN y/o afines al perfil de instructor', 1),
(3, 'Prestar servicios de apoyo a la gestión de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN - GUADUA y/o afines al perfil de instructor.', 1),
(4, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN - ELECTRICIDAD y/o afines al perfil de instructor.', 1),
(5, 'Prestar servicios profesionales o de apoyo a la gestión de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN - TOPOGRAFIA y/o afines al perfil de instructor.', 1),
(6, 'Prestar servicios profesionales a la gestión de carácter temporal, en actividades de instructor en los programas de Formación Profesional Integral de titulada y/o complementaria, estrategia Fondo de la Industria y la Construcción FIC del Centro de Gestión y Desarrollo Sostenible Surcolombiano SENA Regional Huila y su área de influencia, en la especialidad CONSTRUCCIÓN y/o afines al perfil de instructor.', 1),
(7, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área AGRICOLA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 2),
(8, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área AGROPECUARIA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 3),
(9, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área AGRICOLA - BIOLOGO, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 2),
(10, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área AMBIENTAL, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 4),
(11, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área INFORMATICA - SOFTWARE, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 5),
(12, 'Prestar servicios de apoyo a la gestión de carácter temporal, en actividades de instructor del área COCINA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 6),
(13, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área DEPORTES, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 7),
(14, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área INFORMATICA - MULTIMEDIA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 5),
(15, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área INFORMATICA - REDES DE DATOS, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano', 5),
(16, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área ETICA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 8),
(17, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área COMUNICACIÓN, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 9),
(18, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área SEGURIDAD Y SALUD EN EL TRABAJO, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 10),
(19, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área EMPRENDIMIENTO, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 11),
(20, 'Prestar servicios de apoyo a la gestión de carácter temporal, en actividades de instructor del área INFORMATICA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 5),
(21, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área AMBIENTAL - QUIMICA, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano', 4),
(22, 'Prestar servicios profesionales en la planeación y ejecución de la formación, así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de PRODUCCIÓN PECUARIA y afines del CGDSS', 12),
(23, 'Prestar servicios profesionales en la planeación y ejecución de la formación, así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de AGRICOLA - PRODUCCIÓN DE CAFES del Centro de Gestión y Desarrollo Sostenible Surcolombiano, del SENA Regional Huila y su área de cobertura.', 13),
(24, 'Prestar servicios profesionales en la planeación y ejecución de la formación,así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de OPERACIONES FORESTALES y afines del CGDSS', 14),
(25, 'Prestar servicios profesionales en la planeación y ejecución de la formación, así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de COMUNICACIÓN y afines del CGDSS.', 15),
(26, 'Prestar servicios profesionales en la planeación y ejecución de la formación, así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de AGRICOLA - CULTIVOS AGRICOLAS y afines del CGDSS', 13),
(27, 'Prestar servicios profesionales de carácter temporal, en actividades de instructor del área BILINGUISMO-INGLES, impartiendo Formación Profesional Integral, la administración educativa y el seguimiento en la etapa productiva, en las diferentes áreas del conocimiento de la formación Titulada Presencial, Titulada Virtual, Complementaria Presencial, Complementaria Virtual y A Distancia en los programas regular que imparte el Centro de Gestión y Desarrollo Sostenible Surcolombiano.', 16),
(28, 'Prestar servicios profesionales y/o de apoyo a la gestión, en la planeación y ejecución de la formación, así como la evaluación de los resultados de aprendizaje definidos en los diseños curriculares asignados, para el desarrollo de habilidades y competencias técnicas de la población campesina- CampeSENA, en la especialidad de IDIOMAS - INGLES del Centro de Gestión y Desarrollo Sostenible Surcolombiano, del SENA Regional Huila y su área de cobertura', 17) ON CONFLICT DO NOTHING;
SELECT setval('objetos_contractuales_id_objeto_seq', (SELECT MAX(id_objeto) FROM objetos_contractuales));

