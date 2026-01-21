package org.example.backenduvote.service;

import org.example.backenduvote.dtos.OpcionCreateRequest;
import org.example.backenduvote.dtos.OpcionResponse;
import org.example.backenduvote.model.Encuesta;
import org.example.backenduvote.model.Opcion;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.EncuestaRepository;
import org.example.backenduvote.repository.OpcionRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OpcionService {

    private final OpcionRepository opcionRepository;
    private final EncuestaRepository encuestaRepository;
    private final UsuarioRepository usuarioRepository;

    public OpcionService(OpcionRepository opcionRepository,
                         EncuestaRepository encuestaRepository,
                         UsuarioRepository usuarioRepository) {
        this.opcionRepository = opcionRepository;
        this.encuestaRepository = encuestaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public OpcionResponse crearOpcion(Long encuestaId, OpcionCreateRequest request) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        Encuesta encuesta = encuestaRepository.findById(encuestaId)
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        if (encuesta.getFechaCierre() != null) {
            throw new IllegalArgumentException("La encuesta ya está cerrada");
        }

        if (!encuesta.getUsuarioId().equals(usuarioActual.getId())) {
            throw new IllegalArgumentException("No tienes permisos para agregar opciones a esta encuesta");
        }

        if (opcionRepository.existsByEncuestaIdAndNombre(encuestaId, request.getNombre())) {
            throw new IllegalArgumentException("Ya existe una opción con ese nombre en esta encuesta");
        }





        Opcion opcion = new Opcion();
        opcion.setEncuestaId(encuestaId);
        opcion.setNombre(request.getNombre());
        opcion.setDescripcion(request.getDescripcion());
        opcion.setImagenUrl(request.getImagenUrl());
        opcion.setOrden(request.getOrden());
        Integer orden = request.getOrden();

        if (orden == null) {
            Integer maxOrden = opcionRepository.findMaxOrdenByEncuestaId(encuestaId).orElse(0);
            orden = maxOrden + 1;
        }
        opcion.setOrden(orden);

        Opcion guardada = opcionRepository.save(opcion);
        return mapToResponse(guardada);
    }

    public List<OpcionResponse> listarPorEncuesta(Long encuestaId) {
        // Si quieres: validar que la encuesta exista antes de listar (opcional)
        return opcionRepository.findByEncuestaIdOrderByOrdenAsc(encuestaId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void eliminarOpcion(Long opcionId) {
        Usuario usuarioActual = obtenerUsuarioAutenticado();

        Opcion opcion = opcionRepository.findById(opcionId)
                .orElseThrow(() -> new IllegalArgumentException("La opción no existe"));

        Encuesta encuesta = encuestaRepository.findById(opcion.getEncuestaId())
                .orElseThrow(() -> new IllegalArgumentException("La encuesta no existe"));

        if (!encuesta.getUsuarioId().equals(usuarioActual.getId())) {
            throw new IllegalArgumentException("No tienes permisos para eliminar opciones de esta encuesta");
        }

        if (encuesta.getFechaCierre() != null) {
            throw new IllegalArgumentException("No se pueden eliminar opciones de una encuesta cerrada");
        }

        opcionRepository.delete(opcion);
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


    private OpcionResponse mapToResponse(Opcion o) {
        return new OpcionResponse(
                o.getId(),
                o.getEncuestaId(),
                o.getNombre(),
                o.getDescripcion(),
                o.getImagenUrl(),
                o.getOrden()
        );
    }
}
