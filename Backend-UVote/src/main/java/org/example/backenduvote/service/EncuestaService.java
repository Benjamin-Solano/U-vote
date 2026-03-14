package org.example.backenduvote.service;

import org.example.backenduvote.dtos.EncuestaCreateRequest;
import org.example.backenduvote.dtos.EncuestaResponse;
import org.example.backenduvote.model.CampusCarrera;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.CampusCarreraRepository;
import org.example.backenduvote.repository.EncuestaCorreoAutorizadoRepository;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.example.backenduvote.repository.VotoRepository;
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
    private final CampusCarreraRepository campusCarreraRepository;
    private final VotoRepository votoRepository;
    private final EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository;

    public EncuestaService(EncuestaRepository encuestaRepository,
                           UsuarioRepository usuarioRepository,
                           CampusCarreraRepository campusCarreraRepository,
                           VotoRepository votoRepository,
                           EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository) {
        this.encuestaRepository = encuestaRepository;
        this.usuarioRepository = usuarioRepository;
        this.campusCarreraRepository = campusCarreraRepository;
        this.votoRepository = votoRepository;
        this.encuestaCorreoAutorizadoRepository = encuestaCorreoAutorizadoRepository;
    }

    @Transactional
    public EncuestaResponse crearEncuesta(EncuestaCreateRequest request) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        if (request.getInicio() != null && request.getCierre() != null &&
                !request.getCierre().isAfter(request.getInicio())) {
            throw new IllegalArgumentException("La fecha de cierre debe ser posterior a la fecha de inicio");
        }

        boolean tieneCampus = request.getCampusId() != null;
        boolean tieneCarrera = request.getCarreraId() != null;

        if (tieneCampus != tieneCarrera) {
            throw new IllegalArgumentException("Debes seleccionar campus y carrera juntos, o ninguno");
        }

        CampusCarrera campusCarrera = null;
        if (tieneCampus) {
            campusCarrera = campusCarreraRepository
                    .findByCampusIdAndCarreraId(request.getCampusId(), request.getCarreraId())
                    .orElseThrow(() -> new IllegalArgumentException("La carrera seleccionada no pertenece al campus indicado"));
        }

        Encuesta encuesta = new Encuesta();
        encuesta.setUsuarioId(usuarioActual.getId());
        encuesta.setNombre(request.getNombre().trim());
        encuesta.setDescripcion(request.getDescripcion());
        encuesta.setImagenUrl(request.getImagenUrl());
        encuesta.setFechaInicio(request.getInicio());
        encuesta.setFechaCierre(request.getCierre());
        encuesta.setCampusCarrera(campusCarrera);

        Encuesta guardada = encuestaRepository.save(encuesta);
        return mapToResponse(guardada);
    }

    public List<EncuestaResponse> listarEncuestas() {
        return encuestaRepository.findAll().stream().map(this::mapToResponse).toList();
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

        encuesta.setFechaCierre(OffsetDateTime.now());
        return mapToResponse(encuestaRepository.save(encuesta));
    }

    public List<EncuestaResponse> listarPorCreador(Long usuarioId) {
        return encuestaRepository.findByUsuarioIdOrderByIdDesc(usuarioId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EncuestaResponse> listarPorCampusCarrera(Long campusCarreraId) {
        return encuestaRepository.findByCampusCarreraIdOrderByIdDesc(campusCarreraId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EncuestaResponse> listarPorCampusYCarrera(Long campusId, Long carreraId) {
        boolean tieneCampus = campusId != null;
        boolean tieneCarrera = carreraId != null;

        if (!tieneCampus && !tieneCarrera) {
            return listarEncuestas();
        }

        if (tieneCampus != tieneCarrera) {
            throw new IllegalArgumentException("Debes enviar campusId y carreraId juntos");
        }

        var campusCarrera = campusCarreraRepository
                .findByCampusIdAndCarreraId(campusId, carreraId)
                .orElseThrow(() -> new IllegalArgumentException("La combinación campus-carrera no existe"));

        return encuestaRepository.findByCampusCarreraIdOrderByIdDesc(campusCarrera.getId())
                .stream()
                .map(this::mapToResponse)
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

    private Long obtenerUsuarioAutenticadoIdNullable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        try {
            String correo = (String) auth.getPrincipal();
            return usuarioRepository.findByCorreo(correo)
                    .map(Usuario::getId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private String obtenerCorreoAutenticadoNullable() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        try {
            return ((String) auth.getPrincipal()).trim().toLowerCase();
        } catch (Exception e) {
            return null;
        }
    }

    private EncuestaResponse mapToResponse(Encuesta e) {
        CampusCarrera cc = e.getCampusCarrera();

        EncuestaResponse response = new EncuestaResponse(
                e.getId(),
                e.getUsuarioId(),
                e.getNombre(),
                e.getDescripcion(),
                e.getImagenUrl(),
                e.getCreadaEn(),
                e.getFechaInicio(),
                e.getFechaCierre(),
                e.estaCerrada(),
                cc != null ? cc.getId() : null,
                cc != null ? cc.getCampus().getId() : null,
                cc != null ? cc.getCampus().getNombre() : null,
                cc != null ? cc.getCarrera().getId() : null,
                cc != null ? cc.getCarrera().getNombre() : null
        );

        usuarioRepository.findById(e.getUsuarioId())
                .ifPresent(usuario -> response.setUsuarioNombre(usuario.getNombreUsuario()));

        long cantidadCorreosAutorizados = encuestaCorreoAutorizadoRepository.countByEncuestaId(e.getId());
        boolean usaListaCorreos = cantidadCorreosAutorizados > 0;

        response.setUsaListaCorreos(usaListaCorreos);
        response.setCantidadCorreosAutorizados(cantidadCorreosAutorizados);

        Long usuarioActualId = obtenerUsuarioAutenticadoIdNullable();
        String correoActual = obtenerCorreoAutenticadoNullable();

        boolean yaVotoEnTablaVotos =
                usuarioActualId != null &&
                        votoRepository.existsByUsuarioIdAndEncuestaId(usuarioActualId, e.getId());

        boolean yaVotoEnListaAutorizada =
                correoActual != null &&
                        encuestaCorreoAutorizadoRepository
                                .findByEncuestaIdAndCorreo(e.getId(), correoActual)
                                .map(reg -> reg.isYaVoto())
                                .orElse(false);

        response.setYaVoto(yaVotoEnTablaVotos || yaVotoEnListaAutorizada);

        return response;
    }
}