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
| `RESEND_API_KEY` | Resend email delivery |
| `APP_MAIL_FROM` | Sender address for OTP emails |

Optional: `PORT` (default 8080), `JWT_EXPIRATION_MS` (default 3600000), `APP_UPLOAD_DIR` (default `uploads`), `app.otp.resend-seconds` (default 60).

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
4. `JwtAuthenticationFilter` validates `Authorization: Bearer <token>` on protected routes; user lookups are cached via `UsuarioCacheService` (Caffeine, TTL 5 min, max 500 entries)
5. `POST /api/auth/logout` → adds the JWT to an in-memory blacklist (`JwtBlacklistService`) keyed by SHA-256(token); the frontend must send `Authorization: Bearer <token>` on this call

### Security Configuration

Two security filter chains in `SecurityConfig`:

- **Chain 1** (Order 1): `/api/auth/**` — public
- **Chain 2** (Order 2): Everything else — JWT required, with these exceptions permitted without auth: `/api/campus/**`, `/api/carreras/**`, `/api/encuestas/**`, `/api/files/**`, `POST /api/usuarios`

`RateLimitFilter` (Bucket4j) enforces per-IP limits: 10 req/min on `POST /api/auth/login` and `POST /api/auth/resend-code`, 5 req/min on `POST /api/usuarios`, 60 req/min elsewhere.

CORS is configured to allow `localhost:5173`, `u-vote-three.vercel.app`, and `u-vote-git-main-benjaminsolanos-projects.vercel.app`.

### Error Handling

Throw typed exceptions from `errors/` — `GlobalExceptionHandler` maps them automatically:

| Exception | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 |
| `ResourceConflictException` | 409 |
| `BusinessRuleException` | 400 |

`IllegalArgumentException` is still handled as a fallback (string-matching on `"no existe"` → 404, `"ya existe"`/`"ya se encuentra"` → 409, else 400), but new code should use the typed exceptions above.

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

The JWT subject is the user's `correo` (email). `JwtAuthenticationFilter` loads the `Usuario` from the DB on every request (via `UsuarioCacheService`) and sets `correo` as the `Authentication` principal — services retrieve the current user by casting `authentication.getPrincipal()` to `String`.

### Key Dependencies

- **JJWT 0.12.5** — JWT creation and validation
- **Resend** — transactional email for OTP
- **Apache POI** — Excel file parsing (for bulk authorized email imports)
- **Bucket4j** — token-bucket rate limiting per IP
- **Caffeine** — in-process cache for JWT user lookups
- **Spring Validation** — Bean validation on request DTOs
