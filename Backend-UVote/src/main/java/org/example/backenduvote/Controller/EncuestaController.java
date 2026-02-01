package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.EncuestaCreateRequest;
import org.example.backenduvote.dtos.EncuestaResponse;
import org.example.backenduvote.service.EncuestaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encuestas")
public class EncuestaController {

    private final EncuestaService encuestaService;

    public EncuestaController(EncuestaService encuestaService) {
        this.encuestaService = encuestaService;
    }


    @PostMapping
    public ResponseEntity<EncuestaResponse> crear(@Valid @RequestBody EncuestaCreateRequest request) {
        EncuestaResponse creada = encuestaService.crearEncuesta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }


    @GetMapping
    public List<EncuestaResponse> listar() {
        return encuestaService.listarEncuestas();
    }


    @GetMapping("/{id}")
    public ResponseEntity<EncuestaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(encuestaService.obtenerPorId(id));
    }

    // Cerrar encuesta (solo creador)
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<EncuestaResponse> cerrar(@PathVariable Long id) {
        return ResponseEntity.ok(encuestaService.cerrarEncuesta(id));
    }

    @GetMapping("/creador/{id}")
    public List<EncuestaResponse> listarPorCreador(@PathVariable Long id) {
        return encuestaService.listarPorCreador(id);
    }

}
