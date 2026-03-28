package org.example.backenduvote.repository;

import org.example.backenduvote.model.EncuestaCorreoAutorizado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EncuestaCorreoAutorizadoRepository extends JpaRepository<EncuestaCorreoAutorizado, Long> {

    Optional<EncuestaCorreoAutorizado> findByEncuestaIdAndCorreo(Long encuestaId, String correo);

    boolean existsByEncuestaIdAndCorreo(Long encuestaId, String correo);

    long countByEncuestaId(Long encuestaId);

    long countByEncuestaIdAndYaVotoTrue(Long encuestaId);

    long countByEncuestaIdAndYaVotoFalse(Long encuestaId);

    List<EncuestaCorreoAutorizado> findByEncuestaIdOrderByCorreoAsc(Long encuestaId);

    Page<EncuestaCorreoAutorizado> findByEncuestaIdOrderByCorreoAsc(Long encuestaId, Pageable pageable);

    void deleteByEncuestaId(Long encuestaId);

    // Batch: cantidad de correos autorizados agrupada por encuestaId (evita N queries en listados)
    @Query("""
            SELECT eca.encuestaId, COUNT(eca)
            FROM EncuestaCorreoAutorizado eca
            WHERE eca.encuestaId IN :ids
            GROUP BY eca.encuestaId
            """)
    List<Object[]> countPorEncuestaIds(@Param("ids") Collection<Long> ids);

    // Batch: todos los registros de un correo para un conjunto de encuestas
    @Query("""
            SELECT eca FROM EncuestaCorreoAutorizado eca
            WHERE eca.correo = :correo AND eca.encuestaId IN :ids
            """)
    List<EncuestaCorreoAutorizado> findByCorreoAndEncuestaIdIn(@Param("correo") String correo,
                                                               @Param("ids") Collection<Long> ids);
}