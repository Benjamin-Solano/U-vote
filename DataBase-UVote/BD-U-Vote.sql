-- =======================================
--   Esquema de Base de Datos U-Vote
--   PostgreSQL
-- =======================================

-- =======================================
--   Tabla: usuarios
-- =======================================
CREATE TABLE usuarios (
    id               BIGSERIAL PRIMARY KEY,
    nombre_usuario   VARCHAR(100) NOT NULL UNIQUE,
    correo           VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash  VARCHAR(255) NOT NULL,
    foto_perfil      TEXT,
    descripcion      VARCHAR(500),
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- =======================================
--   Tabla: encuestas
-- =======================================
CREATE TABLE encuestas (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id),
    nombre        VARCHAR(100) NOT NULL,
    descripcion   VARCHAR(1000),
    imagen_url    TEXT, -- foto / portada de la encuesta
    creada_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_cierre  TIMESTAMPTZ,
	fecha_inicio  TIMESTAMPTZ
);



-- =======================================
--   Tabla: opciones
-- =======================================
CREATE TABLE opciones (
    id           BIGSERIAL PRIMARY KEY,
    encuesta_id  BIGINT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  VARCHAR(500),
    imagen_url   TEXT,
    orden        INT,
    CONSTRAINT opcion_unica_por_encuesta UNIQUE (encuesta_id, nombre)
);

-- =======================================
--   Tabla: votos
-- =======================================
CREATE TABLE votos (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id),
    encuesta_id   BIGINT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    opcion_id     BIGINT NOT NULL REFERENCES opciones(id),
    imagen_url    TEXT, -- foto asociada al voto (evidencia, avatar, etc.)
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Garantiza voto único por usuario por encuesta
    CONSTRAINT voto_unico_por_usuario_encuesta
        UNIQUE (usuario_id, encuesta_id)
);



-- Índices recomendados
CREATE INDEX idx_votos_encuesta ON votos (encuesta_id);
CREATE INDEX idx_votos_opcion   ON votos (opcion_id);



-- FIN DE LAS TABLAS --
-----------------------
-----------------------
-----------------------


-- Inserts --
-- =======================================
--   Datos de prueba U-Vote
-- =======================================

-- Usuario principal
INSERT INTO usuarios (nombre_usuario, correo, contrasena_hash)
VALUES ('Benjamin', 'benjamin@example.com', 'hash1')
RETURNING id;

-- Guarda este ID
-- Supongamos: Benjamin = 1


-- =======================================
--   Encuesta creada por Benjamin
-- =======================================
INSERT INTO encuestas (usuario_id, nombre, descripcion)
VALUES
(1, 'Perros o Gatos', 'Encuesta para decidir cuál es mejor')
RETURNING id;

-- Supongamos encuesta = 1


-- =======================================
--   Opciones de la encuesta
-- =======================================
INSERT INTO opciones (encuesta_id, nombre, descripcion)
VALUES
(1, 'Perros',  'Amo a los perros'),
(1, 'Gatos',   'Amo a los gatos'),
(1, 'Ninguno', 'No me gustan los animales')
RETURNING id;

-- Supongamos:
-- Perros  = id 1
-- Gatos   = id 2
-- Ninguno = id 3


-- =======================================
--   Crear usuarios ficticios para votar
-- =======================================
INSERT INTO usuarios (nombre_usuario, correo, contrasena_hash) VALUES
('user1', 'user1@example.com', 'x'),
('user2', 'user2@example.com', 'x'),
('user3', 'user3@example.com', 'x'),
('user4', 'user4@example.com', 'x'),
('user5', 'user5@example.com', 'x'),
('user6', 'user6@example.com', 'x'),
('user7', 'user7@example.com', 'x'),
('user8', 'user8@example.com', 'x'),
('user9', 'user9@example.com', 'x'),
('user10','user10@example.com','x'),
('user11','user11@example.com','x'),
('user12','user12@example.com','x'),
('user13','user13@example.com','x'),
('user14','user14@example.com','x'),
('user15','user15@example.com','x');

-- Estos usuarios tendrán IDs del 2 al 16


-- =======================================
--   Insertar votos
-- =======================================

-- 7 votos para Perros (opcion_id = 1)
INSERT INTO votos (usuario_id, encuesta_id, opcion_id) VALUES
(2,  1, 1),
(3,  1, 1),
(4,  1, 1),
(5,  1, 1),
(6,  1, 1),
(7,  1, 1),
(8,  1, 1);

-- 5 votos para Gatos (opcion_id = 2)
INSERT INTO votos (usuario_id, encuesta_id, opcion_id) VALUES
(9,  1, 2),
(10, 1, 2),
(11, 1, 2),
(12, 1, 2),
(13, 1, 2);

-- 3 votos para Ninguno (opcion_id = 3)
INSERT INTO votos (usuario_id, encuesta_id, opcion_id) VALUES
(14, 1, 3),
(15, 1, 3),
(16, 1, 3);



SELECT * FROM encuestas;







