package org.example.backenduvote.repository;

import org.example.backenduvote.model.Opcion;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface OpcionRepository extends JpaRepository<Opcion, Long> {

    List<Opcion> findByEncuestaIdOrderByOrdenAsc(Long encuestaId);

    boolean existsByEncuestaIdAndNombre(Long encuestaId, String nombre);

    long countByEncuestaId(Long encuestaId);

    @Query("select max(o.orden) from Opcion o where o.encuestaId = :encuestaId")
    Optional<Integer> findMaxOrdenByEncuestaId(@Param("encuestaId") Long encuestaId);
}
