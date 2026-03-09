package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.CampusCarreraResponse;
import org.example.backenduvote.dtos.CarreraRequest;
import org.example.backenduvote.dtos.CarreraResponse;
import org.example.backenduvote.service.CarreraService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraService carreraService;

    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }

    @PostMapping
    public ResponseEntity<CarreraResponse> crear(@Valid @RequestBody CarreraRequest request) {
        CarreraResponse creada = carreraService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @GetMapping
    public List<CarreraResponse> listar() {
        return carreraService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarreraResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(carreraService.obtenerPorId(id));
    }

    @GetMapping("/{id}/campus")
    public List<CampusCarreraResponse> listarCampusPorCarrera(@PathVariable Long id) {
        return carreraService.listarCampusPorCarrera(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarreraResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CarreraRequest request
    ) {
        return ResponseEntity.ok(carreraService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        carreraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}