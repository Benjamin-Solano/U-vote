package org.example.backenduvote.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Blacklist de tokens JWT en memoria.
 * Almacena SHA-256(token) → instante de expiración para no guardar tokens en claro.
 *
 * // TODO: Implementar refresh token rotation para mayor seguridad.
 */
@Service
public class JwtBlacklistService {

    /** SHA-256(token) → expiración del token */
    private final ConcurrentHashMap<String, Instant> blacklist = new ConcurrentHashMap<>();

    private final JwtTokenService jwtTokenService;

    public JwtBlacklistService(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    /**
     * Revoca el token agregándolo a la blacklist hasta su expiración natural.
     * Si el token ya expiró o es inválido, la llamada se ignora.
     */
    public void revocarToken(String token) {
        try {
            Instant expiracion = jwtTokenService.obtenerExpiracion(token);
            blacklist.put(sha256(token), expiracion);
        } catch (Exception ignored) {
            // Token inválido o ya expirado — no hace falta agregar a la blacklist
        }
    }

    /** Devuelve {@code true} si el token fue revocado explícitamente. */
    public boolean estaRevocado(String token) {
        return blacklist.containsKey(sha256(token));
    }

    /** Limpia tokens cuya expiración natural ya pasó. Se ejecuta cada 30 minutos. */
    @Scheduled(fixedDelay = 1_800_000)
    public void limpiarExpirados() {
        Instant ahora = Instant.now();
        blacklist.entrySet().removeIf(e -> e.getValue().isBefore(ahora));
    }

    private String sha256(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error calculando SHA-256 del token", e);
        }
    }
}
