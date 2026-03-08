-- =======================================
--   Esquema de Base de Datos U-Vote
--   PostgreSQL
-- =======================================

-- =======================================
--   Tabla: campus
-- =======================================
CREATE TABLE campus (
    id        BIGSERIAL PRIMARY KEY,
    nombre    VARCHAR(300) NOT NULL UNIQUE
);

-- =======================================
--   Tabla: carreras
-- =======================================
CREATE TABLE carreras (
    id        BIGSERIAL PRIMARY KEY,
    nombre    VARCHAR(300) NOT NULL UNIQUE
);

-- =======================================
--   Tabla: campus_carreras
--   Relación válida entre campus y carrera
-- =======================================
CREATE TABLE campus_carreras (
    id          BIGSERIAL PRIMARY KEY,
    campus_id   BIGINT NOT NULL REFERENCES campus(id) ON UPDATE CASCADE ON DELETE CASCADE,
    carrera_id  BIGINT NOT NULL REFERENCES carreras(id) ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT uq_campus_carrera UNIQUE (campus_id, carrera_id)
);

-- =======================================
--   Tabla: usuarios
-- =======================================
CREATE TABLE usuarios (
    id                   BIGSERIAL PRIMARY KEY,
    nombre_usuario       VARCHAR(100) NOT NULL UNIQUE,
    correo               VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash      VARCHAR(255) NOT NULL,

    foto_perfil          TEXT,
    descripcion          VARCHAR(500),

    -- Relación académica válida del estudiante
    campus_carrera_id    BIGINT REFERENCES campus_carreras(id) ON UPDATE CASCADE ON DELETE SET NULL,

    -- Verificación de correo
    email_verificado     BOOLEAN NOT NULL DEFAULT FALSE,
    verif_codigo_hash    VARCHAR(255),
    verif_expira_en      TIMESTAMPTZ,
    verif_intentos       INT NOT NULL DEFAULT 0,
    verif_ultimo_envio   TIMESTAMPTZ,

    creado_en            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =======================================
--   Tabla: encuestas
-- =======================================
CREATE TABLE encuestas (
    id                  BIGSERIAL PRIMARY KEY,
    usuario_id          BIGINT NOT NULL REFERENCES usuarios(id),
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(1000),
    imagen_url          TEXT, -- foto / portada de la encuesta

    -- Restricción académica de la encuesta
    -- NULL = "No necesario" / abierta para todos
    campus_carrera_id   BIGINT REFERENCES campus_carreras(id) ON UPDATE CASCADE ON DELETE SET NULL,

    creada_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_inicio        TIMESTAMPTZ,
    fecha_cierre        TIMESTAMPTZ
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

-- =======================================
--   Índices recomendados
-- =======================================
CREATE INDEX idx_campus_carreras_campus
    ON campus_carreras (campus_id);

CREATE INDEX idx_campus_carreras_carrera
    ON campus_carreras (carrera_id);

CREATE INDEX idx_usuarios_campus_carrera
    ON usuarios (campus_carrera_id);

CREATE INDEX idx_encuestas_usuario
    ON encuestas (usuario_id);

CREATE INDEX idx_encuestas_campus_carrera
    ON encuestas (campus_carrera_id);

CREATE INDEX idx_opciones_encuesta
    ON opciones (encuesta_id);

CREATE INDEX idx_votos_encuesta
    ON votos (encuesta_id);

CREATE INDEX idx_votos_opcion
    ON votos (opcion_id);

CREATE INDEX idx_votos_usuario
    ON votos (usuario_id);

-----------------------
-- FIN DE LAS TABLAS --
-----------------------

SELECT * FROM campus;
SELECT * FROM carreras;
SELECT * FROM campus_carreras;
SELECT * FROM usuarios;
SELECT * FROM encuestas;
SELECT * FROM opciones;
SELECT * FROM votos;

TRUNCATE TABLE votos, opciones, encuestas, usuarios, campus_carreras, carreras, campus CASCADE;














-- INSERTS:
-- =======================================
-- INSERTS: campus
-- =======================================
INSERT INTO campus (nombre) VALUES
('Benjamín Nuñez'),
('Omar Dengo');

-- =======================================
-- INSERTS: carreras
-- =======================================
INSERT INTO carreras (nombre) VALUES
('Ingeniería en Sistemas'),
('Ciencias del Movimiento Humano'),
('Arte y Comunicación Visual'),
('Biología'),
('Relaciones Internacionales'),
('Veterinaria'),
('Historia'),
('Administración de Empresas'),
('Economía'),
('Psicología'),
('Filosofía'),
('Inteligencia Global');

-- =======================================
-- INSERTS: campus_carreras
-- Benjamín Nuñez:
-- - Ingeniería en Sistemas
-- - Ciencias del Movimiento Humano
-- - Veterinaria
-- - Inteligencia Global
-- =======================================
INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Ingeniería en Sistemas'
WHERE c.nombre = 'Benjamín Nuñez';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Ciencias del Movimiento Humano'
WHERE c.nombre = 'Benjamín Nuñez';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Veterinaria'
WHERE c.nombre = 'Benjamín Nuñez';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Inteligencia Global'
WHERE c.nombre = 'Benjamín Nuñez';

-- =======================================
-- INSERTS: campus_carreras
-- Omar Dengo:
-- Todas las demás
-- =======================================
INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Arte y Comunicación Visual'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Biología'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Relaciones Internacionales'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Historia'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Administración de Empresas'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Economía'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Psicología'
WHERE c.nombre = 'Omar Dengo';

INSERT INTO campus_carreras (campus_id, carrera_id)
SELECT c.id, ca.id
FROM campus c
JOIN carreras ca ON ca.nombre = 'Filosofía'
WHERE c.nombre = 'Omar Dengo';
