package org.example.backenduvote.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // De momento desactivamos CSRF para poder probar tranquilo con Postman
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                                // Permitir registrar usuario sin autenticación
                                .requestMatchers(HttpMethod.POST, "/api/usuarios/**").permitAll()

                                // Permitir consultar usuarios sin autenticación (lista y uno por nombre)
                                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").permitAll()

                                // Lo demás, por ahora también lo podemos dejar libre o protegido
                                .anyRequest().permitAll()
                        // Si luego quieres proteger todo lo demás:
                        // .anyRequest().authenticated()
                );

        return http.build();
    }

    // Bean para el encoder (puedes usarlo en UsuarioService vía inyección)
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}