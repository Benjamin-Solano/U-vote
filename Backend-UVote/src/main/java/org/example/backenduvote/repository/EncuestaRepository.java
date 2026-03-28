package org.example.backenduvote.repository;

import org.example.backenduvote.model.Encuesta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {

    List<Encuesta> findByUsuarioId(Long usuarioId);

    List<Encuesta> findByUsuarioIdOrderByIdDesc(Long usuarioId);

    List<Encuesta> findByCampusCarreraIdOrderByIdDesc(Long campusCarreraId);

    // ─── Variantes con JOIN FETCH para eliminar N+1 en campus/carrera ────────

    @Query("""
            SELECT e FROM Encuesta e
            LEFT JOIN FETCH e.campusCarrera cc
            LEFT JOIN FETCH cc.campus
            LEFT JOIN FETCH cc.carrera
            ORDER BY e.id DESC
            """)
    List<Encuesta> findAllConRelaciones();

    @Query(value = """
            SELECT e FROM Encuesta e
            LEFT JOIN FETCH e.campusCarrera cc
            LEFT JOIN FETCH cc.campus
            LEFT JOIN FETCH cc.carrera
            """,
            countQuery = "SELECT COUNT(e) FROM Encuesta e")
    Page<Encuesta> findAllConRelaciones(Pageable pageable);

    @Query("""
            SELECT e FROM Encuesta e
            LEFT JOIN FETCH e.campusCarrera cc
            LEFT JOIN FETCH cc.campus
            LEFT JOIN FETCH cc.carrera
            WHERE e.usuarioId = :usuarioId
            ORDER BY e.id DESC
            """)
    List<Encuesta> findByUsuarioIdConRelaciones(@Param("usuarioId") Long usuarioId);

    @Query("""
            SELECT e FROM Encuesta e
            LEFT JOIN FETCH e.campusCarrera cc
            LEFT JOIN FETCH cc.campus
            LEFT JOIN FETCH cc.carrera
            WHERE cc.id = :campusCarreraId
            ORDER BY e.id DESC
            """)
    List<Encuesta> findByCampusCarreraIdConRelaciones(@Param("campusCarreraId") Long campusCarreraId);
}