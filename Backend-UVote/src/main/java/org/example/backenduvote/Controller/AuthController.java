package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.AuthLoginRequest;
import org.example.backenduvote.dtos.AuthResponse;
import org.example.backenduvote.dtos.ResendCodeRequest;
import org.example.backenduvote.dtos.VerifyCodeRequest;
import org.example.backenduvote.repository.UsuarioRepository;
import org.example.backenduvote.service.AuthService;
import org.example.backenduvote.service.VerificationCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.example.backenduvote.dtos.AuthStatusResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.OffsetDateTime;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationCodeService verificationCodeService;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.otp.resend-seconds:60}")
    private int resendSeconds;


    public AuthController(AuthService authService,
                          VerificationCodeService verificationCodeService,
                          UsuarioRepository usuarioRepository) {
        this.authService = authService;
        this.verificationCodeService = verificationCodeService;
        this.usuarioRepository = usuarioRepository;
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


    @GetMapping("/status")
    public ResponseEntity<AuthStatusResponse> status(@RequestParam("correo") String correo) {

        // Respuesta por defecto (no revela existencia)
        AuthStatusResponse resp = new AuthStatusResponse("LOGIN", null);

        usuarioRepository.findByCorreo(correo).ifPresent(u -> {
            if (!u.isEmailVerificado()) {

                int remaining = 0;

                OffsetDateTime last = u.getVerifUltimoEnvio();
                if (last != null) {
                    OffsetDateTime allowed = last.plusSeconds(resendSeconds);
                    OffsetDateTime now = OffsetDateTime.now();

                    if (now.isBefore(allowed)) {
                        long diff = java.time.Duration.between(now, allowed).getSeconds();
                        remaining = (int) Math.max(0, diff);
                    }
                }

                // Solo si existe y está pendiente, indicamos VERIFY
                resp.setNextStep("VERIFY");
                resp.setResendAvailableIn(remaining);
            }
        });

        return ResponseEntity.ok(resp);
    }



}
