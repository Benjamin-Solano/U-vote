package org.example.backenduvote.service;

import org.example.backenduvote.dtos.CarreraRequest;
import org.example.backenduvote.dtos.CarreraResponse;
import org.example.backenduvote.dtos.CampusCarreraResponse;

import java.util.List;

public interface CarreraService {
    CarreraResponse crear(CarreraRequest request);
    List<CarreraResponse> listar();
    CarreraResponse obtenerPorId(Long id);
    CarreraResponse actualizar(Long id, CarreraRequest request);
    void eliminar(Long id);

    List<CampusCarreraResponse> listarCampusPorCarrera(Long carreraId);
}