# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
./mvnw clean install

# Run
./mvnw spring-boot:run

# Test
./mvnw test

# Run a single test class
./mvnw test -Dtest=ClassName

# Build without tests
./mvnw clean install -DskipTests
```

## Required Environment Variables

The app will not start without these:

| Variable | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | HMAC-SHA signing key for JWTs |
| `SENDGRID_API_KEY` | SendGrid email delivery |

Optional: `PORT` (default 8080), `JWT_EXPIRATION_MS` (default 3600000), `APP_UPLOAD_DIR` (default `uploads`), OTP tuning vars.

## Architecture

Spring Boot 3.5.7 / Java 21 REST API. Clean 4-layer architecture:

```
Controller → Service → Repository → PostgreSQL (via Spring Data JPA)
```

**JPA DDL strategy is `validate`** — Hibernate will NOT auto-create or migrate the schema. The database schema must already exist before startup.

### Domain Model

The core domain is organized around campus/career scoping:

- **Campus** → **Carrera** → **CampusCarrera** (junction): All surveys and users belong to a `CampusCarrera`, which scopes content by academic division.
- **Usuario**: Users with email verification state. OTP codes are stored BCrypt-hashed.
- **Encuesta** (Survey): Has open/close dates. Status (not started / active / closed) is derived from these dates via model methods like `estaActivaEn()`.
- **Opcion**: Choices within a survey (ordered).
- **Voto**: One vote per user per survey, enforced by a DB unique constraint.
- **EncuestaCorreoAutorizado**: Optional whitelist of emails allowed to vote in a survey.

### Authentication Flow

1. `POST /api/auth/registro` → creates user with `emailVerificado=false`, sends OTP via SendGrid
2. `POST /api/auth/verify-code` → validates OTP (BCrypt hash, 15 min expiry, max 5 attempts), sets `emailVerificado=true`
3. `POST /api/auth/login` → requires verified email, returns JWT
4. `JwtAuthenticationFilter` validates `Authorization: Bearer <token>` on protected routes

### Security Configuration

Two security filter chains in `SecurityConfig`:

- **Chain 1** (Order 1): `/api/auth/**` — public
- **Chain 2** (Order 2): Everything else — JWT required, with these exceptions permitted without auth: `/api/campus/**`, `/api/carreras/**`, `/api/encuestas/**`, `/api/files/**`, `POST /api/usuarios`

CORS is configured to allow `localhost:5173`, `u-vote-three.vercel.app`, and `u-vote-git-main-benjaminsolanos-projects.vercel.app`.

### Error Handling

`GlobalExceptionHandler` (`errors/`) maps exception messages to HTTP status codes by inspecting the message string:
- Contains `"no existe"` → 404
- Contains `"ya existe"` or `"ya se encuentra"` → 409
- Default → 400

Throw `RuntimeException` with one of these phrases to get the correct status automatically.

### Vote Eligibility Rules (`VotoService`)

Before accepting a vote, the service checks in order:
1. Survey must be active (between `fechaInicio` and `fechaCierre`)
2. User cannot vote on their own survey
3. User has not already voted (DB unique constraint also enforces this)
4. If survey has a `CampusCarrera` restriction, voter must belong to the same `CampusCarrera`
5. If survey has authorized emails (`EncuestaCorreoAutorizado`), voter's email must be on the list

### Authorized Email System

Emails are uploaded via Excel (`.xlsx`/`.xls`) and must use the `@est.una.ac.cr` domain. `ExcelCorreosService` validates domain, detects duplicates, and reports counts. `EncuestaCorreoAutorizado.yaVoto` is set to `true` when the authorized voter casts their vote.

### JWT Principal

The JWT subject is the user's `correo` (email). `JwtAuthenticationFilter` loads the `Usuario` from the DB on every request and sets `correo` as the `Authentication` principal — services retrieve the current user by casting `authentication.getPrincipal()` to `String`.

### Key Dependencies

- **JJWT 0.12.5** — JWT creation and validation
- **SendGrid** — transactional email for OTP
- **Apache POI** — Excel file parsing (for bulk authorized email imports)
- **Spring Validation** — Bean validation on request DTOs
