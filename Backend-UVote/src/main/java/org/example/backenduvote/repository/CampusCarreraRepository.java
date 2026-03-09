package org.example.backenduvote.repository;

import org.example.backenduvote.model.CampusCarrera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CampusCarreraRepository extends JpaRepository<CampusCarrera, Long> {

    Optional<CampusCarrera> findByCampusIdAndCarreraId(Long campusId, Long carreraId);

    boolean existsByCampusIdAndCarreraId(Long campusId, Long carreraId);

    List<CampusCarrera> findByCampusIdOrderByCarrera_NombreAsc(Long campusId);

    List<CampusCarrera> findByCarreraIdOrderByCampus_NombreAsc(Long carreraId);
}