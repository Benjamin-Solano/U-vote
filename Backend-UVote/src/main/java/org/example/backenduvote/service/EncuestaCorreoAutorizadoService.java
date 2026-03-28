package org.example.backenduvote.service;

import org.example.backenduvote.dtos.CargaCorreosResponse;
import org.example.backenduvote.dtos.EncuestaCorreoAutorizadoResponse;
import org.example.backenduvote.dtos.ParticipacionEncuestaResponse;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.EncuestaCorreoAutorizado;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.EncuestaCorreoAutorizadoRepository;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class EncuestaCorreoAutorizadoService {

    private final EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository;
    private final EncuestaRepository encuestaRepository;
    private final ExcelCorreosService excelCorreosService;
    private final UsuarioRepository usuarioRepository;

    public EncuestaCorreoAutorizadoService(EncuestaCorreoAutorizadoRepository encuestaCorreoAutorizadoRepository,
                                           EncuestaRepository encuestaRepository,
                                           ExcelCorreosService excelCorreosService,
                                           UsuarioRepository usuarioRepository) {
        this.encuestaCorreoAutorizadoRepository = encuestaCorreoAutorizadoRepository;
        this.encuestaRepository = encuestaRepository;
        this.excelCorreosService = excelCorreosService;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public CargaCorreosResponse cargarCorreosDesdeExcel(Long encuestaId, MultipartFile file) {
        Encuesta encuesta = encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        // Verificar que el usuario autenticado sea el creador de la encuesta
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new AccessDeniedException("No autenticado");
        }
        String correoAuth = (String) auth.getPrincipal();
        Usuario usuarioAuth = usuarioRepository.findByCorreo(correoAuth)
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
        if (!encuesta.getUsuarioId().equals(usuarioAuth.getId())) {
            throw new AccessDeniedException("No tienes permisos para gestionar los correos de esta encuesta");
        }

        ExcelCorreosService.ResultadoParseoCorreos resultado = excelCorreosService.procesarArchivo(file);

        encuestaCorreoAutorizadoRepository.deleteByEncuestaId(encuesta.getId());

        List<String> correosValidos = resultado.getCorreosValidos();

        for (String correo : correosValidos) {
            EncuestaCorreoAutorizado registro = new EncuestaCorreoAutorizado();
            registro.setEncuestaId(encuesta.getId());
            registro.setCorreo(correo);
            registro.setYaVoto(false);
            encuestaCorreoAutorizadoRepository.save(registro);
        }

        CargaCorreosResponse resumen = resultado.getResumen();
        resumen.setTotalGuardados(correosValidos.size());

        return resumen;
    }

    public List<EncuestaCorreoAutorizadoResponse> listarPorEncuesta(Long encuestaId) {
        validarEncuestaExiste(encuestaId);

        return encuestaCorreoAutorizadoRepository.findByEncuestaIdOrderByCorreoAsc(encuestaId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<EncuestaCorreoAutorizadoResponse> listarPorEncuesta(Long encuestaId, Pageable pageable) {
        validarEncuestaExiste(encuestaId);

        return encuestaCorreoAutorizadoRepository
                .findByEncuestaIdOrderByCorreoAsc(encuestaId, pageable)
                .map(this::mapToResponse);
    }

    public ParticipacionEncuestaResponse obtenerParticipacion(Long encuestaId) {
        validarEncuestaExiste(encuestaId);

        long totalAutorizados = encuestaCorreoAutorizadoRepository.countByEncuestaId(encuestaId);
        long totalYaVotaron = encuestaCorreoAutorizadoRepository.countByEncuestaIdAndYaVotoTrue(encuestaId);
        long totalPendientes = encuestaCorreoAutorizadoRepository.countByEncuestaIdAndYaVotoFalse(encuestaId);

        return new ParticipacionEncuestaResponse(
                totalAutorizados,
                totalYaVotaron,
                totalPendientes
        );
    }

    public EncuestaCorreoAutorizado obtenerRegistroPorEncuestaYCorreo(Long encuestaId, String correo) {
        return encuestaCorreoAutorizadoRepository.findByEncuestaIdAndCorreo(encuestaId, normalizarCorreo(correo))
                .orElse(null);
    }

    @Transactional
    public void marcarComoYaVoto(Long encuestaId, String correo) {
        EncuestaCorreoAutorizado registro = encuestaCorreoAutorizadoRepository
                .findByEncuestaIdAndCorreo(encuestaId, normalizarCorreo(correo))
                .orElseThrow(() -> new IllegalArgumentException("El correo no está autorizado para esta encuesta"));

        if (!registro.isYaVoto()) {
            registro.setYaVoto(true);
            encuestaCorreoAutorizadoRepository.save(registro);
        }
    }

    public boolean existeCorreoAutorizado(Long encuestaId, String correo) {
        return encuestaCorreoAutorizadoRepository.existsByEncuestaIdAndCorreo(
                encuestaId,
                normalizarCorreo(correo)
        );
    }

    private void validarEncuestaExiste(Long encuestaId) {
        if (!encuestaRepository.existsById(encuestaId)) {
            throw new IllegalArgumentException("La encuesta no existe");
        }
    }

    private EncuestaCorreoAutorizadoResponse mapToResponse(EncuestaCorreoAutorizado e) {
        return new EncuestaCorreoAutorizadoResponse(
                e.getId(),
                e.getEncuestaId(),
                e.getCorreo(),
                e.isYaVoto()
        );
    }

    private String normalizarCorreo(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }
}