
package org.example.backenduvote.service;

import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

@Service
public class VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(VerificationCodeService.class);

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.minutes:15}")
    private int otpMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-seconds:60}")
    private int resendSeconds;

    public VerificationCodeService(UsuarioRepository usuarioRepository,
                                   BCryptPasswordEncoder passwordEncoder,
                                   EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
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

        // Guardamos el hash + expiración sí o sí
        usuario.setVerifCodigoHash(passwordEncoder.encode(code));
        usuario.setVerifExpiraEn(ahora.plusMinutes(otpMinutes));
        usuario.setVerifUltimoEnvio(ahora);
        usuario.setVerifIntentos(0);

        usuarioRepository.save(usuario);

        // Intentamos enviar el correo, pero si falla NO bloqueamos el flujo
        try {
            emailService.enviarCodigoVerificacion(usuario.getCorreo(), code, otpMinutes);
        } catch (Exception ex) {
            log.warn("No se pudo enviar correo OTP a {}: {}", usuario.getCorreo(), ex.getMessage());
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

        boolean ok = passwordEncoder.matches(codigo, usuario.getVerifCodigoHash());
        if (!ok) {
            usuario.setVerifIntentos(usuario.getVerifIntentos() + 1);
            usuarioRepository.save(usuario);
            throw new IllegalArgumentException("Código incorrecto");
        }

        // ✅ activar
        usuario.setEmailVerificado(true);
        usuario.setVerifCodigoHash(null);
        usuario.setVerifExpiraEn(null);
        usuario.setVerifIntentos(0);

        usuarioRepository.save(usuario);
    }

    private String generarCodigo6() {
        int n = random.nextInt(1_000_000);
        return String.format("%06d", n);
    }
}
