package org.example.backenduvote.repository;


import org.example.backenduvote.model.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VotoRepository extends JpaRepository<Voto, Long> {

    boolean existsByUsuarioIdAndEncuestaId(Long usuarioId, Long encuestaId);

    Optional<Voto> findByUsuarioIdAndEncuestaId(Long usuarioId, Long encuestaId);

    long countByEncuestaId(Long encuestaId);

    // Resultados: conteo por opcion_id
    @Query("""
           select v.opcionId, count(v)
           from Voto v
           where v.encuestaId = :encuestaId
           group by v.opcionId
           order by count(v) desc
           """)
    List<Object[]> contarVotosPorOpcion(@Param("encuestaId") Long encuestaId);

    @Query("""
           select v.opcionId, o.nombre, count(v)
           from Voto v, Opcion o
           where v.encuestaId = :encuestaId
             and o.id = v.opcionId
           group by v.opcionId, o.nombre
           order by count(v) desc
           """)
    List<Object[]> contarVotosPorOpcionConNombre(@Param("encuestaId") Long encuestaId);




}
