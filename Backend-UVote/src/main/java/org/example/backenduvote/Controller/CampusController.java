package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.CampusCarreraResponse;
import org.example.backenduvote.dtos.CampusRequest;
import org.example.backenduvote.dtos.CampusResponse;
import org.example.backenduvote.service.CampusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
public class CampusController {

    private final CampusService campusService;

    public CampusController(CampusService campusService) {
        this.campusService = campusService;
    }

    @PostMapping
    public ResponseEntity<CampusResponse> crear(@Valid @RequestBody CampusRequest request) {
        CampusResponse creado = campusService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    public List<CampusResponse> listar() {
        return campusService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampusResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(campusService.obtenerPorId(id));
    }

    @GetMapping("/{id}/carreras")
    public List<CampusCarreraResponse> listarCarrerasPorCampus(@PathVariable Long id) {
        return campusService.listarCarrerasPorCampus(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CampusRequest request
    ) {
        return ResponseEntity.ok(campusService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        campusService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}