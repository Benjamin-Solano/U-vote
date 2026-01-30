package org.example.backenduvote.service;

import org.example.backenduvote.dtos.EncuestaCreateRequest;
import org.example.backenduvote.dtos.EncuestaResponse;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class EncuestaService {

    private final EncuestaRepository encuestaRepository;
    private final UsuarioRepository usuarioRepository;

    public EncuestaService(EncuestaRepository encuestaRepository,
                           UsuarioRepository usuarioRepository) {
        this.encuestaRepository = encuestaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public EncuestaResponse crearEncuesta(EncuestaCreateRequest request) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        // Validación de rango si vienen ambas
        if (request.getInicio() != null && request.getCierre() != null) {
            if (!request.getCierre().isAfter(request.getInicio())) {
                throw new IllegalArgumentException("La fecha de cierre debe ser posterior a la fecha de inicio");
            }
        }

        Encuesta encuesta = new Encuesta();
        encuesta.setUsuarioId(usuarioActual.getId());
        encuesta.setNombre(request.getNombre());
        encuesta.setDescripcion(request.getDescripcion());

        encuesta.setImagenUrl(request.getImagenUrl());
        encuesta.setFechaInicio(request.getInicio());   // si null -> @PrePersist la pone
        encuesta.setFechaCierre(request.getCierre());   // puede ser null (sin cierre)

        Encuesta guardada = encuestaRepository.save(encuesta);
        return mapToResponse(guardada);
    }

    public List<EncuestaResponse> listarEncuestas() {
        return encuestaRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EncuestaResponse obtenerPorId(Long id) {
        Encuesta encuesta = encuestaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));
        return mapToResponse(encuesta);
    }

    @Transactional
    public EncuestaResponse cerrarEncuesta(Long encuestaId) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        Encuesta encuesta = encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        if (!encuesta.getUsuarioId().equals(usuarioActual.getId())) {
            throw new IllegalArgumentException("No tienes permisos para cerrar esta encuesta");
        }

        encuesta.setFechaCierre(OffsetDateTime.now()); // cierra ya
        return mapToResponse(encuestaRepository.save(encuesta));
    }


    private Usuario obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("No autenticado");
        }

        String correo = (String) auth.getPrincipal();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
    }

    public List<EncuestaResponse> listarPorCreador(Long usuarioId) {
        return encuestaRepository.findByUsuarioIdOrderByIdDesc(usuarioId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    private EncuestaResponse mapToResponse(Encuesta e) {
        return new EncuestaResponse(
                e.getId(),
                e.getUsuarioId(),
                e.getNombre(),
                e.getDescripcion(),
                e.getImagenUrl(),
                e.getCreadaEn(),
                e.getFechaInicio(),
                e.getFechaCierre(),
                e.estaCerrada()
        );
    }

}
