package org.example.backenduvote.Controller;

import org.example.backenduvote.dtos.CargaCorreosResponse;
import org.example.backenduvote.dtos.EncuestaCorreoAutorizadoResponse;
import org.example.backenduvote.dtos.ParticipacionEncuestaResponse;
import org.example.backenduvote.service.EncuestaCorreoAutorizadoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/encuestas/{encuestaId}")
public class EncuestaCorreoAutorizadoController {

    private final EncuestaCorreoAutorizadoService encuestaCorreoAutorizadoService;

    public EncuestaCorreoAutorizadoController(EncuestaCorreoAutorizadoService encuestaCorreoAutorizadoService) {
        this.encuestaCorreoAutorizadoService = encuestaCorreoAutorizadoService;
    }

    @PostMapping(value = "/correos-autorizados", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CargaCorreosResponse> cargarCorreos(
            @PathVariable Long encuestaId,
            @RequestPart("file") MultipartFile file
    ) {
        CargaCorreosResponse response = encuestaCorreoAutorizadoService.cargarCorreosDesdeExcel(encuestaId, file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/correos-autorizados")
    public ResponseEntity<Page<EncuestaCorreoAutorizadoResponse>> listarCorreos(
            @PathVariable Long encuestaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        int safeSize = Math.min(size, 100);
        return ResponseEntity.ok(encuestaCorreoAutorizadoService.listarPorEncuesta(encuestaId, PageRequest.of(page, safeSize)));
    }

    @GetMapping("/participacion")
    public ResponseEntity<ParticipacionEncuestaResponse> obtenerParticipacion(@PathVariable Long encuestaId) {
        return ResponseEntity.ok(encuestaCorreoAutorizadoService.obtenerParticipacion(encuestaId));
    }
}