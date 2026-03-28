package org.example.backenduvote.service;

import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Capa de caché para lookups de usuario por correo usados en el filtro JWT.
 * TTL: 5 minutos, máximo 500 entradas (configurado en CacheConfig).
 */
@Service
public class UsuarioCacheService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioCacheService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Cacheable(value = "usuarios-jwt", key = "#correo")
    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    @CacheEvict(value = "usuarios-jwt", key = "#correo")
    public void evictarPorCorreo(String correo) {
        // Spring elimina la entrada del caché al invocar este método
    }
}
