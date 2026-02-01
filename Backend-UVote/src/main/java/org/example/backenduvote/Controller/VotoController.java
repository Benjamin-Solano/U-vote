package org.example.backenduvote.Controller;

import jakarta.validation.Valid;
import org.example.backenduvote.dtos.VotoCreateRequest;
import org.example.backenduvote.dtos.VotoResponse;
import org.example.backenduvote.service.VotoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backenduvote.dtos.ResultadoOpcionDetalleResponse;

import java.util.List;

@RestController
@RequestMapping("/api/encuestas")
public class VotoController {

    private final VotoService votoService;

    public VotoController(VotoService votoService) {
        this.votoService = votoService;
    }


    @PostMapping("/{encuestaId}/votos")
    public ResponseEntity<VotoResponse> votar(
            @PathVariable Long encuestaId,
            @Valid @RequestBody VotoCreateRequest request
    ) {
        VotoResponse voto = votoService.votar(encuestaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(voto);
    }


    @GetMapping("/{encuestaId}/resultados")
    public List<ResultadoOpcionDetalleResponse> resultados(@PathVariable Long encuestaId) {
        return votoService.resultados(encuestaId);
    }
}
