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


import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Registrar usuario
    @PostMapping
    public ResponseEntity<UsuarioResponse> registrarUsuario(
            @Valid @RequestBody UsuarioRegistroRequest request
    ) {
        UsuarioResponse usuario = usuarioService.registrarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    // Listar usuarios
    @GetMapping
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    // Obtener usuario por nombre
    @GetMapping("/nombre/{nombreUsuario}")
    public ResponseEntity<UsuarioResponse> getUsuarioPorNombre(
            @PathVariable String nombreUsuario
    ) {
        UsuarioResponse usuario = usuarioService.obtenerPorNombre(nombreUsuario);
        return ResponseEntity.ok(usuario);
    }

    // Eliminar usuario por id
    @DeleteMapping("/id/{id}")
    public ResponseEntity<Void> eliminarUsuarioPorId(@PathVariable Long id) {
        usuarioService.eliminarPorId(id);
        return ResponseEntity.noContent().build(); // 204
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

    @PostMapping(value = "/id/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponse> subirFotoPerfil(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication auth
    ) {
        UsuarioResponse actualizado = usuarioService.actualizarFotoPerfilSeguro(id, file, auth);
        return ResponseEntity.ok(actualizado);
    }


}
