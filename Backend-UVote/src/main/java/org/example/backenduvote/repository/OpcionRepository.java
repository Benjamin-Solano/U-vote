package org.example.backenduvote.repository;

import org.example.backenduvote.model.Opcion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpcionRepository extends JpaRepository<Opcion, Long> {

    List<Opcion> findByEncuestaIdOrderByOrdenAsc(Long encuestaId);

    boolean existsByEncuestaIdAndNombre(Long encuestaId, String nombre);

    long countByEncuestaId(Long encuestaId);
}
