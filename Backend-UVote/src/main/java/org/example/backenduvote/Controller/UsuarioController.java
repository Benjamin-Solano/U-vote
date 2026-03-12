package org.example.backenduvote.Controller;

import org.example.backenduvote.dtos.UsuarioRegistroRequest;
import org.example.backenduvote.dtos.UsuarioResponse;
import jakarta.validation.Valid;
import org.example.backenduvote.dtos.UsuarioUpdateRequest;
import org.example.backenduvote.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> registrarUsuario(
            @Valid @RequestBody UsuarioRegistroRequest request
    ) {
        UsuarioResponse usuario = usuarioService.registrarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @GetMapping
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/nombre/{nombreUsuario}")
    public ResponseEntity<UsuarioResponse> getUsuarioPorNombre(
            @PathVariable String nombreUsuario
    ) {
        UsuarioResponse usuario = usuarioService.obtenerPorNombre(nombreUsuario);
        return ResponseEntity.ok(usuario);
    }

    @DeleteMapping("/id/{id}")
    public ResponseEntity<Void> eliminarUsuarioPorId(@PathVariable Long id) {
        usuarioService.eliminarPorId(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/id/{id}")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request,
            Authentication auth
    ) {
        UsuarioResponse actualizado = usuarioService.actualizarUsuarioSeguro(id, request, auth);
        return ResponseEntity.ok(actualizado);
    }
}