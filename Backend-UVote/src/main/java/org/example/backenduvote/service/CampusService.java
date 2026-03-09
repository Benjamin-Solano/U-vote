package org.example.backenduvote.service;

import org.example.backenduvote.dtos.CampusCarreraResponse;
import org.example.backenduvote.dtos.CampusRequest;
import org.example.backenduvote.dtos.CampusResponse;

import java.util.List;

public interface CampusService {
    CampusResponse crear(CampusRequest request);
    List<CampusResponse> listar();
    CampusResponse obtenerPorId(Long id);
    CampusResponse actualizar(Long id, CampusRequest request);
    void eliminar(Long id);

    List<CampusCarreraResponse> listarCarrerasPorCampus(Long campusId);
}