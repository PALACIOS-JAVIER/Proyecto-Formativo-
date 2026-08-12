-- Insertar Sede por defecto
INSERT INTO sedes (nombre) 
VALUES ('Yamboro') 
ON CONFLICT DO NOTHING;

-- Obtener el ID de la sede (asumiendo que es 1, pero puedes ajustar si difiere)
-- En PostgreSQL se puede usar un subquery si es necesario.

-- Insertar roles
INSERT INTO roles (nombre, id_sede) 
VALUES ('regular fit', 1), ('campesena', 1) 
ON CONFLICT DO NOTHING;

-- Insertar área General
INSERT INTO areas (nombre, id_rol) 
VALUES ('General', 1) 
ON CONFLICT DO NOTHING;

-- Insertar Usuario Coordinador (reemplaza con los datos reales de tu coordinador)
-- Nota: La contraseña está en texto plano temporalmente. 
-- El sistema la cifrará automáticamente la primera vez que el coordinador inicie sesión.
INSERT INTO usuarios (nombre, apellido, cedula, telefono, correo, password, estado_cuenta, id_sede, id_rol, id_area)
VALUES (
    'NombreCoordinador', 
    'ApellidoCoordinador', 
    123456789, 
    3000000000, 
    'coordinador@sena.edu.co', 
    'ContraseñaSegura123', 
    'aprobado', 
    1, 
    1, 
    1
) 
ON CONFLICT (correo) DO NOTHING;

-- Agregar este usuario a la tabla de coordinadores
INSERT INTO coordinadores (id_sede, id_usuario, anio_ejercicio)
VALUES (
    1, 
    (SELECT "id_Usuario" FROM usuarios WHERE correo = 'coordinador@sena.edu.co'), 
    2024
) 
ON CONFLICT DO NOTHING;
