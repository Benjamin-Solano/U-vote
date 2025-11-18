package service;

import dtos.UsuarioRegistroRequest;
import dtos.UsuarioResponse;
import model.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import repository.UsuarioRepository;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public UsuarioResponse registrarUsuario(UsuarioRegistroRequest request) {

        // Validar si el nombre del usuario ya existe...
        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre del usuario ya existe");
        }

        // Validar si el correo del usuario ya existe
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        // Tomar los datos del request y
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(request.getNombreUsuario());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasenaHash(passwordEncoder.encode(request.getContrasena()));

        return mapToResponse(usuarioRepository.save(usuario));
    }


    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public UsuarioResponse obtenerPorNombre(String nombre) {
        Usuario usuario = usuarioRepository.findByNombreUsuario(nombre).orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));
        return mapToResponse(usuario);
    }

    private UsuarioResponse mapToResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNombreUsuario(), usuario.getCorreo(), usuario.getCreadoEn());
    }

    public long contarUsuarios() {
        return usuarioRepository.count();
    }
}
