package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.AuthLoginRequest;
import org.example.backenduvote.dtos.AuthResponse;
import org.example.backenduvote.dtos.ResendCodeRequest;
import org.example.backenduvote.dtos.VerifyCodeRequest;
import org.example.backenduvote.repository.UsuarioRepository;
import org.example.backenduvote.security.JwtBlacklistService;
import org.example.backenduvote.service.AuthService;
import org.example.backenduvote.service.VerificationCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.springframework.beans.factory.annotation.Value;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationCodeService verificationCodeService;
    private final UsuarioRepository usuarioRepository;
    private final JwtBlacklistService jwtBlacklistService;

    @Value("${app.otp.resend-seconds:60}")
    private int resendSeconds;


    public AuthController(AuthService authService,
                          VerificationCodeService verificationCodeService,
                          UsuarioRepository usuarioRepository,
                          JwtBlacklistService jwtBlacklistService) {
        this.authService = authService;
        this.verificationCodeService = verificationCodeService;
        this.usuarioRepository = usuarioRepository;
        this.jwtBlacklistService = jwtBlacklistService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        verificationCodeService.verificarCodigo(request.getCorreo(), request.getCodigo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resend-code")
    public ResponseEntity<Void> resendCode(@Valid @RequestBody ResendCodeRequest request) {
        // Respuesta genérica aunque el correo no exista (evita enumeración)
        usuarioRepository.findByCorreo(request.getCorreo()).ifPresent(u ->
                verificationCodeService.generarYEnviarCodigo(u, true)
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Revoca el JWT actual agregándolo a la blacklist.
     * Requiere autenticación (el token debe ser válido para poder revocarlo).
     *
     * // BREAKING: el frontend debe llamar a POST /api/auth/logout con el header
     * // Authorization: Bearer <token> al cerrar sesión, en lugar de solo borrar
     * // el token del almacenamiento local.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtBlacklistService.revocarToken(token);
        }
        return ResponseEntity.ok().build();
    }

    // GET /api/auth/status eliminado — revelaba si un correo está registrado y
    // pendiente de verificación, lo que permite enumeración de cuentas.
    // El frontend debe determinar el nextStep a partir de la respuesta de
    // POST /api/usuarios (registro devuelve 201 → mostrar pantalla OTP) y de
    // POST /api/auth/login (403 "Cuenta no verificada" → mostrar pantalla OTP).
    // BREAKING: el frontend debe actualizarse para no llamar a GET /api/auth/status.
}
