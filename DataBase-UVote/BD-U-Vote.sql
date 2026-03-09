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





INSERT INTO usuarios (
    nombre_usuario,
    correo,
    contrasena_hash,
    foto_perfil,
    descripcion,
    campus_carrera_id,
    email_verificado,
    verif_codigo_hash,
    verif_expira_en,
    verif_intentos,
    verif_ultimo_envio
) VALUES (
    'Alexander',
    'alexander@est.una.ac.cr',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7qVn6l3Qn4Y8Q0C5Y6f7d8e9r1a2K',
    NULL,
    'Usuario agregado manualmente para pruebas de votación',
    1,
    TRUE,
    NULL,
    NULL,
    0,
    NULL
);






-- =========================================================
--  Crear 500 usuarios y distribuir votos en encuesta id=3
--  Distribución:
--    Opción 5 -> 165 votos (33%)
--    Opción 6 -> 280 votos (56%)
--    Opción 7 ->  55 votos (11%)
-- =========================================================

WITH encuesta_target AS (
    SELECT
        e.id AS encuesta_id,
        e.campus_carrera_id
    FROM encuestas e
    WHERE e.id = 3
),
campus_fallback AS (
    SELECT cc.id AS campus_carrera_id
    FROM campus_carreras cc
    ORDER BY cc.id
    LIMIT 1
),
nuevos_usuarios AS (
    INSERT INTO usuarios (
        nombre_usuario,
        correo,
        contrasena_hash,
        foto_perfil,
        descripcion,
        campus_carrera_id,
        email_verificado,
        verif_codigo_hash,
        verif_expira_en,
        verif_intentos,
        verif_ultimo_envio
    )
    SELECT
        'votante_uvote_' || LPAD(gs::text, 4, '0') AS nombre_usuario,
        'votante_uvote_' || LPAD(gs::text, 4, '0') || '@est.una.ac.cr' AS correo,
        '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7qVn6l3Qn4Y8Q0C5Y6f7d8e9r1a2K' AS contrasena_hash,
        NULL AS foto_perfil,
        'Usuario simulado para carga de votos en U-Vote' AS descripcion,
        COALESCE(et.campus_carrera_id, cf.campus_carrera_id) AS campus_carrera_id,
        TRUE AS email_verificado,
        NULL AS verif_codigo_hash,
        NULL AS verif_expira_en,
        0 AS verif_intentos,
        NULL AS verif_ultimo_envio
    FROM generate_series(1, 500) AS gs
    CROSS JOIN encuesta_target et
    CROSS JOIN campus_fallback cf
    RETURNING id
),
usuarios_ordenados AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM nuevos_usuarios
)
INSERT INTO votos (
    usuario_id,
    encuesta_id,
    opcion_id,
    imagen_url
)
SELECT
    uo.id AS usuario_id,
    3 AS encuesta_id,
    CASE
        WHEN uo.rn <= 165 THEN 5
        WHEN uo.rn <= 445 THEN 6
        ELSE 7
    END AS opcion_id,
    NULL AS imagen_url
FROM usuarios_ordenados uo
ORDER BY uo.rn;
