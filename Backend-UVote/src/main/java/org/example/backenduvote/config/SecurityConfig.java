package org.example.backenduvote.config;

import org.example.backenduvote.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS para permitir que el frontend (Vite) en http://localhost:5173
     * pueda llamar al backend en http://localhost:8080.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Origen del frontend
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // ✅ Métodos permitidos (incluye OPTIONS para preflight)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ✅ Headers permitidos
        config.setAllowedHeaders(List.of("*"));

        // ✅ Si usas cookies/sesión no aplica mucho porque es JWT stateless,
        // pero lo dejamos habilitado por compatibilidad (si no lo necesitas, puedes poner false)
        config.setAllowCredentials(true);

        // Opcional: headers expuestos
        config.setExposedHeaders(List.of("Authorization"));




        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 1) Auth: público y sin filtro JWT
    @Bean
    @Order(1)
    public SecurityFilterChain authChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/auth/**")
                .cors(Customizer.withDefaults()) // ✅ Habilita CORS
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // 2) API: reglas + filtro JWT
    @Bean
    @Order(2)
    public SecurityFilterChain apiChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Archivos públicos (foto perfil)
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                        // ✅ Usuarios (registro y lectura públicas por ahora)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios", "/api/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/usuarios", "/api/usuarios/**").permitAll()

                        // ✅ Encuestas: GET público
                        .requestMatchers(HttpMethod.GET,  "/api/encuestas", "/api/encuestas/**").permitAll()

                        // ✅ Opciones: lectura pública (ID como 1 segmento)
                        .requestMatchers(HttpMethod.GET, "/api/encuestas/*/opciones").permitAll()

                        // ✅ Votos: resultados públicos
                        .requestMatchers(HttpMethod.GET, "/api/encuestas/**/resultados").permitAll()

                        // ✅ Todo lo demás requiere auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}
