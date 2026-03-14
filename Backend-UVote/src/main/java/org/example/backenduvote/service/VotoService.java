package org.example.backenduvote.service;

import org.example.backenduvote.dtos.ResultadoOpcionDetalleResponse;
import org.example.backenduvote.dtos.VotoCreateRequest;
import org.example.backenduvote.dtos.VotoResponse;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.EncuestaCorreoAutorizado;
import org.example.backenduvote.model.Opcion;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.model.Voto;
import org.example.backenduvote.repository.EncuestaCorreoAutorizadoRepository;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.OpcionRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.example.backenduvote.repository.VotoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class VotoService {

    private final VotoRepository votoRepository;
    private final EncuestaRepository encuestaRepository;
    private final OpcionRepository opcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository;

    public VotoService(VotoRepository votoRepository,
                       EncuestaRepository encuestaRepository,
                       OpcionRepository opcionRepository,
                       UsuarioRepository usuarioRepository,
                       EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository) {
        this.votoRepository = votoRepository;
        this.encuestaRepository = encuestaRepository;
        this.opcionRepository = opcionRepository;
        this.usuarioRepository = usuarioRepository;
        this.encuestaCorreoAutorizadoRepository = encuestaCorreoAutorizadoRepository;
    }

    @Transactional
    public VotoResponse votar(Long encuestaId, VotoCreateRequest request) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        Encuesta encuesta = encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        OffsetDateTime ahora = OffsetDateTime.now();

        if (encuesta.getUsuarioId() != null && encuesta.getUsuarioId().equals(usuarioActual.getId())) {
            throw new IllegalArgumentException("No puedes votar en una encuesta creada por ti");
        }

        if (encuesta.getFechaInicio() != null && ahora.isBefore(encuesta.getFechaInicio())) {
            throw new IllegalArgumentException("La encuesta aún no ha iniciado");
        }

        if (encuesta.getFechaCierre() != null && !ahora.isBefore(encuesta.getFechaCierre())) {
            throw new IllegalArgumentException("La encuesta ya está cerrada");
        }

        EncuestaCorreoAutorizado registroAutorizado = validarElegibilidad(usuarioActual, encuesta);

        Long opcionId = request.getOpcionId();

        Opcion opcion = opcionRepository.findById(opcionId)
                .orElseThrow(() -> new IllegalArgumentException("La opción no existe"));

        if (!opcion.getEncuestaId().equals(encuestaId)) {
            throw new IllegalArgumentException("La opción no pertenece a esta encuesta");
        }

        if (votoRepository.existsByUsuarioIdAndEncuestaId(usuarioActual.getId(), encuestaId)) {
            throw new IllegalArgumentException("Ya has votado en esta encuesta");
        }

        Voto voto = new Voto();
        voto.setUsuarioId(usuarioActual.getId());
        voto.setEncuestaId(encuestaId);
        voto.setOpcionId(opcionId);
        voto.setImagenUrl(request.getImagenUrl());

        try {
            Voto guardado = votoRepository.save(voto);

            if (registroAutorizado != null && !registroAutorizado.isYaVoto()) {
                registroAutorizado.setYaVoto(true);
                encuestaCorreoAutorizadoRepository.save(registroAutorizado);
            }

            return mapToResponse(guardado);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Ya has votado en esta encuesta");
        }
    }

    public List<ResultadoOpcionDetalleResponse> resultados(Long encuestaId) {
        encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        return votoRepository.contarVotosPorOpcionConNombre(encuestaId)
                .stream()
                .map(row -> new ResultadoOpcionDetalleResponse(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .toList();
    }

    private EncuestaCorreoAutorizado validarElegibilidad(Usuario usuario, Encuesta encuesta) {
        if (encuesta.getCampusCarrera() != null) {
            if (usuario.getCampusCarrera() == null ||
                    !encuesta.getCampusCarrera().getId().equals(usuario.getCampusCarrera().getId())) {
                throw new IllegalArgumentException("No perteneces al campus y carrera requeridos para votar en esta encuesta");
            }
        }

        long totalAutorizados = encuestaCorreoAutorizadoRepository.countByEncuestaId(encuesta.getId());

        if (totalAutorizados == 0) {
            return null;
        }

        String correoUsuario = normalizarCorreo(usuario.getCorreo());

        EncuestaCorreoAutorizado registro = encuestaCorreoAutorizadoRepository
                .findByEncuestaIdAndCorreo(encuesta.getId(), correoUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Tu correo no está autorizado para votar en esta encuesta"));

        if (registro.isYaVoto()) {
            throw new IllegalArgumentException("Ya has votado en esta encuesta");
        }

        return registro;
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

    private String normalizarCorreo(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    private VotoResponse mapToResponse(Voto v) {
        return new VotoResponse(
                v.getId(),
                v.getUsuarioId(),
                v.getEncuestaId(),
                v.getOpcionId(),
                v.getImagenUrl(),
                v.getCreadoEn()
        );
    }
}