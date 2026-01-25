package org.example.backenduvote.service;

import org.example.backenduvote.security.JwtTokenService;
import org.example.backenduvote.dtos.AuthLoginRequest;
import org.example.backenduvote.dtos.AuthResponse;
import org.example.backenduvote.dtos.UsuarioResponse;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final UsuarioService usuarioService;

    public AuthService(UsuarioRepository usuarioRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService,
                       UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.usuarioService = usuarioService;
    }

    public AuthResponse login(AuthLoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasenaHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = jwtTokenService.generarToken(usuario.getCorreo());
        UsuarioResponse usuarioResponse = mapToResponse(usuario);

        return new AuthResponse(token, usuarioResponse);
    }

    private UsuarioResponse mapToResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombreUsuario(),
                usuario.getCorreo(),
                usuario.getCreadoEn(),
                usuario.getFotoPerfil(),
                usuario.getDescripcion()
        );
    }
}