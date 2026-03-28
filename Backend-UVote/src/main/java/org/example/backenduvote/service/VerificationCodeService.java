package org.example.backenduvote.service;

import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HexFormat;

@Service
public class VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(VerificationCodeService.class);

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.minutes:15}")
    private int otpMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-seconds:60}")
    private int resendSeconds;

    public VerificationCodeService(UsuarioRepository usuarioRepository,
                                   EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    public void generarYEnviarCodigo(Usuario usuario, boolean esReenvio) {
        if (usuario == null) return;
        if (usuario.isEmailVerificado()) return;

        OffsetDateTime ahora = OffsetDateTime.now();

        // Rate-limit de reenvío
        if (esReenvio && usuario.getVerifUltimoEnvio() != null) {
            OffsetDateTime permitido = usuario.getVerifUltimoEnvio().plusSeconds(resendSeconds);
            if (ahora.isBefore(permitido)) {
                throw new IllegalArgumentException("Espera unos segundos antes de reenviar el código");
            }
        }

        String code = generarCodigo6();

        usuario.setVerifCodigoHash(generarHashOtp(code));
        usuario.setVerifExpiraEn(ahora.plusMinutes(otpMinutes));
        usuario.setVerifUltimoEnvio(ahora);
        usuario.setVerifIntentos(0);

        usuarioRepository.save(usuario);

        try {
            emailService.enviarCodigoVerificacion(usuario.getCorreo(), code, otpMinutes);
            log.info("Correo OTP enviado a {}", usuario.getCorreo());
        } catch (Exception ex) {
            log.error("No se pudo enviar correo OTP a {}", usuario.getCorreo(), ex);
            throw new RuntimeException("No se pudo enviar el correo de verificación", ex);
        }
    }

    public void verificarCodigo(String correo, String codigo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (usuario.isEmailVerificado()) return;

        OffsetDateTime ahora = OffsetDateTime.now();

        if (usuario.getVerifCodigoHash() == null || usuario.getVerifExpiraEn() == null) {
            throw new IllegalArgumentException("No hay un código activo. Solicita uno nuevo.");
        }

        if (ahora.isAfter(usuario.getVerifExpiraEn())) {
            throw new IllegalArgumentException("El código ha expirado. Solicita uno nuevo.");
        }

        if (usuario.getVerifIntentos() >= maxAttempts) {
            throw new AccessDeniedException("Demasiados intentos. Solicita un nuevo código.");
        }

        boolean ok = verificarHashOtp(codigo, usuario.getVerifCodigoHash());
        if (!ok) {
            usuario.setVerifIntentos(usuario.getVerifIntentos() + 1);
            usuarioRepository.save(usuario);
            throw new IllegalArgumentException("Código incorrecto");
        }

        usuario.setEmailVerificado(true);
        usuario.setVerifCodigoHash(null);
        usuario.setVerifExpiraEn(null);
        usuario.setVerifIntentos(0);

        usuarioRepository.save(usuario);
    }

    // ─── OTP hashing con HMAC-SHA256 (reemplaza BCrypt para códigos temporales) ─

    /**
     * Genera un hash HMAC-SHA256 del código OTP con un salt aleatorio.
     * Formato almacenado: "{saltHex}:{hmacHex}"
     */
    private String generarHashOtp(String code) {
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        String saltHex = HexFormat.of().formatHex(saltBytes);
        return saltHex + ":" + calcularHmac(saltHex, code);
    }

    /**
     * Verifica un código OTP contra el hash almacenado usando comparación timing-safe.
     */
    private boolean verificarHashOtp(String code, String hashAlmacenado) {
        String[] partes = hashAlmacenado.split(":", 2);
        if (partes.length != 2) return false;
        byte[] esperado = calcularHmac(partes[0], code).getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] actual   = partes[1].getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return MessageDigest.isEqual(esperado, actual);
    }

    private String calcularHmac(String saltHex, String code) {
        try {
            byte[] saltBytes = HexFormat.of().parseHex(saltHex);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(saltBytes, "HmacSHA256"));
            return HexFormat.of().formatHex(
                    mac.doFinal(code.getBytes(java.nio.charset.StandardCharsets.UTF_8))
            );
        } catch (Exception e) {
            throw new RuntimeException("Error calculando HMAC-SHA256", e);
        }
    }

    private String generarCodigo6() {
        int n = random.nextInt(1_000_000);
        return String.format("%06d", n);
    }
}
