package org.example.backenduvote.service;

import org.example.backenduvote.dtos.CampusCarreraResponse;
import org.example.backenduvote.dtos.CarreraRequest;
import org.example.backenduvote.dtos.CarreraResponse;
import org.example.backenduvote.model.CampusCarrera;
import org.example.backenduvote.model.Carrera;
import org.example.backenduvote.repository.CampusCarreraRepository;
import org.example.backenduvote.repository.CarreraRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final CampusCarreraRepository campusCarreraRepository;

    public CarreraServiceImpl(CarreraRepository carreraRepository,
                              CampusCarreraRepository campusCarreraRepository) {
        this.carreraRepository = carreraRepository;
        this.campusCarreraRepository = campusCarreraRepository;
    }

    @Override
    public CarreraResponse crear(CarreraRequest request) {
        String nombreLimpio = limpiarNombre(request.getNombre());

        if (carreraRepository.existsByNombreIgnoreCase(nombreLimpio)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una carrera con ese nombre."
            );
        }

        Carrera carrera = new Carrera();
        carrera.setNombre(nombreLimpio);

        Carrera guardada = carreraRepository.save(carrera);
        return toResponse(guardada);
    }

    @Override
    public List<CarreraResponse> listar() {
        return carreraRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CarreraResponse obtenerPorId(Long id) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Carrera no encontrada."
                ));

        return toResponse(carrera);
    }

    @Override
    public CarreraResponse actualizar(Long id, CarreraRequest request) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Carrera no encontrada."
                ));

        String nombreLimpio = limpiarNombre(request.getNombre());

        carreraRepository.findByNombreIgnoreCase(nombreLimpio)
                .ifPresent(existente -> {
                    if (!existente.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Ya existe otra carrera con ese nombre."
                        );
                    }
                });

        carrera.setNombre(nombreLimpio);

        Carrera actualizada = carreraRepository.save(carrera);
        return toResponse(actualizada);
    }

    @Override
    public void eliminar(Long id) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Carrera no encontrada."
                ));

        carreraRepository.delete(carrera);
    }

    @Override
    public List<CampusCarreraResponse> listarCampusPorCarrera(Long carreraId) {
        if (!carreraRepository.existsById(carreraId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Carrera no encontrada."
            );
        }

        return campusCarreraRepository.findByCarreraIdOrderByCampus_NombreAsc(carreraId)
                .stream()
                .map(this::toCampusCarreraResponse)
                .toList();
    }

    private CarreraResponse toResponse(Carrera carrera) {
        return new CarreraResponse(
                carrera.getId(),
                carrera.getNombre()
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
                    "El nombre de la carrera es obligatorio."
            );
        }
        return nombre.trim();
    }
}