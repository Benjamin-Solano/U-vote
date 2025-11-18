package Controller;


import dtos.UsuarioRegistroRequest;
import dtos.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Registrar Usuarios...
    @PostMapping
    public ResponseEntity<UsuarioResponse> registrarUsuario(@Valid @RequestBody UsuarioRegistroRequest request) {
        UsuarioResponse usuario = usuarioService.registrarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    // Mostrar Todos los usuarios...
    @GetMapping
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    // Obtener usuario en especifico por nombre...
    @GetMapping
    public ResponseEntity<UsuarioResponse> getUsuario(@PathVariable String nombreUsuario) {
        UsuarioResponse usuario = usuarioService.obtenerPorNombre(nombreUsuario);
        return ResponseEntity.ok(usuario);
    }
    
}
