package org.example.backenduvote.service;

import org.example.backenduvote.dtos.VotoCreateRequest;
import org.example.backenduvote.dtos.VotoResponse;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.Opcion;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.model.Voto;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.OpcionRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.example.backenduvote.repository.VotoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backenduvote.dtos.ResultadoOpcionDetalleResponse;


import java.util.List;

@Service
public class VotoService {

    private final VotoRepository votoRepository;
    private final EncuestaRepository encuestaRepository;
    private final OpcionRepository opcionRepository;
    private final UsuarioRepository usuarioRepository;

    public VotoService(VotoRepository votoRepository,
                       EncuestaRepository encuestaRepository,
                       OpcionRepository opcionRepository,
                       UsuarioRepository usuarioRepository) {
        this.votoRepository = votoRepository;
        this.encuestaRepository = encuestaRepository;
        this.opcionRepository = opcionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public VotoResponse votar(Long encuestaId, VotoCreateRequest request) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        Encuesta encuesta = encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        if (encuesta.getFechaCierre() != null) {
            throw new IllegalArgumentException("La encuesta ya está cerrada");
        }

        Long opcionId = request.getOpcionId();

        Opcion opcion = opcionRepository.findById(opcionId)
                .orElseThrow(() -> new IllegalArgumentException("La opción no existe"));

        if (!opcion.getEncuestaId().equals(encuestaId)) {
            throw new IllegalArgumentException("La opción no pertenece a esta encuesta");
        }

        // validación rápida (amigable) antes de intentar insertar
        if (votoRepository.existsByUsuarioIdAndEncuestaId(usuarioActual.getId(), encuestaId)) {
            throw new IllegalArgumentException("Ya has votado en esta encuesta");
        }

        Voto voto = new Voto();
        voto.setUsuarioId(usuarioActual.getId());
        voto.setEncuestaId(encuestaId);
        voto.setOpcionId(opcionId);

        try {
            Voto guardado = votoRepository.save(voto);
            return mapToResponse(guardado);
        } catch (DataIntegrityViolationException e) {
            // respaldo por si hubo condición de carrera: BD asegura el UNIQUE(usuario_id, encuesta_id)
            throw new IllegalArgumentException("Ya has votado en esta encuesta");
        }
    }

    public List<ResultadoOpcionDetalleResponse> resultados(Long encuestaId) {
        encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        return votoRepository.contarVotosPorOpcionConNombre(encuestaId)
                .stream()
                .map(row -> new ResultadoOpcionDetalleResponse(
                        (Long) row[0],     // opcionId
                        (String) row[1],   // nombre
                        (Long) row[2]      // count(v) es Long
                ))
                .toList();
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

    private VotoResponse mapToResponse(Voto v) {
        return new VotoResponse(v.getId(), v.getUsuarioId(), v.getEncuestaId(), v.getOpcionId(), v.getCreadoEn());
    }
}
