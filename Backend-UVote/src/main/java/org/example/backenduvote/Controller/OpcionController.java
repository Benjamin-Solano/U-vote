package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.OpcionCreateRequest;
import org.example.backenduvote.dtos.OpcionResponse;
import org.example.backenduvote.service.OpcionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OpcionController {

    private final OpcionService opcionService;

    public OpcionController(OpcionService opcionService) {
        this.opcionService = opcionService;
    }

    // Crear opción dentro de una encuesta (requiere JWT y ser dueño de la encuesta)
    @PostMapping("/api/encuestas/{encuestaId}/opciones")
    public ResponseEntity<OpcionResponse> crear(
            @PathVariable Long encuestaId,
            @Valid @RequestBody OpcionCreateRequest request
    ) {
        OpcionResponse creada = opcionService.crearOpcion(encuestaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // Listar opciones de una encuesta (público)
    @GetMapping("/api/encuestas/{encuestaId}/opciones")
    public List<OpcionResponse> listar(@PathVariable Long encuestaId) {
        return opcionService.listarPorEncuesta(encuestaId);
    }

    // Eliminar opción (requiere JWT y ser dueño de la encuesta)
    @DeleteMapping("/api/opciones/{opcionId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long opcionId) {
        opcionService.eliminarOpcion(opcionId);
        return ResponseEntity.noContent().build();
    }
}
