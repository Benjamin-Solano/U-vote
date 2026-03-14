package org.example.backenduvote.repository;

import org.example.backenduvote.model.EncuestaCorreoAutorizado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EncuestaCorreoAutorizadoRepository extends JpaRepository<EncuestaCorreoAutorizado, Long> {

    Optional<EncuestaCorreoAutorizado> findByEncuestaIdAndCorreo(Long encuestaId, String correo);

    boolean existsByEncuestaIdAndCorreo(Long encuestaId, String correo);

    long countByEncuestaId(Long encuestaId);

    long countByEncuestaIdAndYaVotoTrue(Long encuestaId);

    long countByEncuestaIdAndYaVotoFalse(Long encuestaId);

    List<EncuestaCorreoAutorizado> findByEncuestaIdOrderByCorreoAsc(Long encuestaId);

    void deleteByEncuestaId(Long encuestaId);
}