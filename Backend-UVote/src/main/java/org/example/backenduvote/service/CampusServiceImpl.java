package org.example.backenduvote.service;

import org.example.backenduvote.dtos.CampusCarreraResponse;
import org.example.backenduvote.dtos.CampusRequest;
import org.example.backenduvote.dtos.CampusResponse;
import org.example.backenduvote.model.Campus;
import org.example.backenduvote.model.CampusCarrera;
import org.example.backenduvote.repository.CampusCarreraRepository;
import org.example.backenduvote.repository.CampusRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CampusServiceImpl implements CampusService {

    private final CampusRepository campusRepository;
    private final CampusCarreraRepository campusCarreraRepository;

    public CampusServiceImpl(CampusRepository campusRepository,
                             CampusCarreraRepository campusCarreraRepository) {
        this.campusRepository = campusRepository;
        this.campusCarreraRepository = campusCarreraRepository;
    }

    @Override
    public CampusResponse crear(CampusRequest request) {
        String nombreLimpio = limpiarNombre(request.getNombre());

        if (campusRepository.existsByNombreIgnoreCase(nombreLimpio)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un campus con ese nombre."
            );
        }

        Campus campus = new Campus();
        campus.setNombre(nombreLimpio);

        Campus guardado = campusRepository.save(campus);
        return toResponse(guardado);
    }

    @Override
    public List<CampusResponse> listar() {
        return campusRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CampusResponse obtenerPorId(Long id) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Campus no encontrado."
                ));

        return toResponse(campus);
    }

    @Override
    public CampusResponse actualizar(Long id, CampusRequest request) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Campus no encontrado."
                ));

        String nombreLimpio = limpiarNombre(request.getNombre());

        campusRepository.findByNombreIgnoreCase(nombreLimpio)
                .ifPresent(existente -> {
                    if (!existente.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Ya existe otro campus con ese nombre."
                        );
                    }
                });

        campus.setNombre(nombreLimpio);

        Campus actualizado = campusRepository.save(campus);
        return toResponse(actualizado);
    }

    @Override
    public void eliminar(Long id) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Campus no encontrado."
                ));

        campusRepository.delete(campus);
    }

    @Override
    public List<CampusCarreraResponse> listarCarrerasPorCampus(Long campusId) {
        if (!campusRepository.existsById(campusId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Campus no encontrado."
            );
        }

        return campusCarreraRepository.findByCampusIdOrderByCarrera_NombreAsc(campusId)
                .stream()
                .map(this::toCampusCarreraResponse)
                .toList();
    }

    private CampusResponse toResponse(Campus campus) {
        return new CampusResponse(
                campus.getId(),
                campus.getNombre()
        );
    }

    private CampusCarreraResponse toCampusCarreraResponse(CampusCarrera cc) {
        return new CampusCarreraResponse(
                cc.getId(),
                cc.getCampus().getId(),
                cc.getCampus().getNombre(),
                cc.getCarrera().getId(),
                cc.getCarrera().getNombre()
        );
    }

    private String limpiarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre del campus es obligatorio."
            );
        }
        return nombre.trim();
    }
}