package org.example.backenduvote.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backenduvote.errors.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filtro de rate limiting por IP usando Bucket4j.
 * Límites:
 *   - POST /api/auth/login, POST /api/auth/resend-code : 10 req/min
 *   - POST /api/usuarios (registro)                   : 5 req/min
 *   - Resto de rutas                                   : 60 req/min
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LIMITE_LOGIN_RESEND = 10;
    private static final int LIMITE_REGISTRO     = 5;
    private static final int LIMITE_GENERAL      = 60;

    private final ConcurrentHashMap<String, Bucket> loginBuckets    = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> registroBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> generalBuckets  = new ConcurrentHashMap<>();

    /** Último acceso por IP (compartido entre los tres mapas de buckets). */
    private final ConcurrentHashMap<String, Instant> ultimoAcceso = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip     = request.getRemoteAddr();
        String path   = request.getRequestURI();
        String method = request.getMethod();

        ultimoAcceso.put(ip, Instant.now());

        Bucket bucket = resolverBucket(ip, path, method);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            responder429(request, response);
        }
    }

    private Bucket resolverBucket(String ip, String path, String method) {
        boolean esPost = "POST".equalsIgnoreCase(method);

        if (esPost && (path.equals("/api/auth/login") || path.equals("/api/auth/resend-code"))) {
            return loginBuckets.computeIfAbsent(ip, k -> crearBucket(LIMITE_LOGIN_RESEND));
        }
        if (esPost && path.equals("/api/usuarios")) {
            return registroBuckets.computeIfAbsent(ip, k -> crearBucket(LIMITE_REGISTRO));
        }
        return generalBuckets.computeIfAbsent(ip, k -> crearBucket(LIMITE_GENERAL));
    }

    private Bucket crearBucket(int capacidad) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(capacidad, Refill.intervally(capacidad, Duration.ofMinutes(1))))
                .build();
    }

    private void responder429(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too Many Requests",
                "Demasiadas solicitudes. Intenta de nuevo en unos segundos.",
                request.getRequestURI()
        );
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), error);
    }

    /**
     * Limpieza de buckets inactivos. Se ejecuta cada 10 minutos y elimina
     * entradas de IPs sin actividad en los últimos 15 minutos.
     */
    @Scheduled(fixedDelay = 600_000)
    public void limpiarBuckets() {
        Instant limite = Instant.now().minus(Duration.ofMinutes(15));
        ultimoAcceso.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(limite)) {
                String ip = entry.getKey();
                loginBuckets.remove(ip);
                registroBuckets.remove(ip);
                generalBuckets.remove(ip);
                return true;
            }
            return false;
        });
    }
}
