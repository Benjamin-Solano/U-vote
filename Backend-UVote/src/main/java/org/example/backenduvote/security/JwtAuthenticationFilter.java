package org.example.backenduvote.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.service.UsuarioCacheService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenService jwtTokenService;
    private final UsuarioCacheService usuarioCacheService;
    private final JwtBlacklistService jwtBlacklistService;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService,
                                   UsuarioCacheService usuarioCacheService,
                                   JwtBlacklistService jwtBlacklistService) {
        this.jwtTokenService = jwtTokenService;
        this.usuarioCacheService = usuarioCacheService;
        this.jwtBlacklistService = jwtBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {


        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraer token del header
        String token = extraerToken(request);
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Validar firma y expiración del token
        if (!jwtTokenService.esTokenValido(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3.5 Verificar que el token no haya sido revocado (logout explícito)
        if (jwtBlacklistService.estaRevocado(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Obtener subject (correo del usuario)
        String correo = jwtTokenService.obtenerSubject(token);
        if (!StringUtils.hasText(correo)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 5. Buscar usuario (con caché Caffeine, TTL 5 min)
        Optional<Usuario> optionalUsuario = usuarioCacheService.findByCorreo(correo);
        if (optionalUsuario.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }

        Usuario usuario = optionalUsuario.get();


        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        usuario.getCorreo(),
                        null,
                        Collections.emptyList()
                );

        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // 7. Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }

    private String extraerToken(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTH_HEADER);
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return authHeader.substring(BEARER_PREFIX.length());
    }
}
