package org.example.backenduvote.service;

import org.example.backenduvote.dtos.UsuarioRegistroRequest;
import org.example.backenduvote.dtos.UsuarioResponse;
import org.example.backenduvote.dtos.UsuarioUpdateRequest;
import org.example.backenduvote.model.CampusCarrera;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.CampusCarreraRepository;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CampusCarreraRepository campusCarreraRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final VerificationCodeService verificationCodeService;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          CampusCarreraRepository campusCarreraRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          VerificationCodeService verificationCodeService) {
        this.usuarioRepository = usuarioRepository;
        this.campusCarreraRepository = campusCarreraRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationCodeService = verificationCodeService;
    }

    public UsuarioResponse registrarUsuario(UsuarioRegistroRequest request) {
        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre del usuario ya existe");
        }

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        CampusCarrera campusCarrera = campusCarreraRepository
                .findByCampusIdAndCarreraId(request.getCampusId(), request.getCarreraId())
                .orElseThrow(() -> new IllegalArgumentException("La carrera seleccionada no pertenece al campus indicado"));

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(request.getNombreUsuario().trim());
        usuario.setCorreo(request.getCorreo().trim());
        usuario.setContrasenaHash(passwordEncoder.encode(request.getContrasena()));
        usuario.setFotoPerfil(null);
        usuario.setDescripcion(null);
        usuario.setCampusCarrera(campusCarrera);
        usuario.setEmailVerificado(false);

        Usuario saved = usuarioRepository.save(usuario);
        verificationCodeService.generarYEnviarCodigo(saved, false);

        return mapToResponse(saved);
    }

    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public UsuarioResponse obtenerPorNombre(String nombre) {
        Usuario usuario = usuarioRepository.findByNombreUsuario(nombre)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));
        return mapToResponse(usuario);
    }

    public long contarUsuarios() {
        return usuarioRepository.count();
    }

    @Transactional
    public void eliminarPorId(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario no existe");
        }
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public UsuarioResponse actualizarUsuario(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        if (request.getNombreUsuario() != null && !request.getNombreUsuario().isBlank()) {
            String nuevo = request.getNombreUsuario().trim();
            if (!nuevo.equals(usuario.getNombreUsuario()) && usuarioRepository.existsByNombreUsuario(nuevo)) {
                throw new IllegalArgumentException("El nombre del usuario ya existe");
            }
            usuario.setNombreUsuario(nuevo);
        }

        if (request.getDescripcion() != null) {
            String desc = request.getDescripcion().trim();
            usuario.setDescripcion(desc.isBlank() ? null : desc);
        }

        if (request.getFotoPerfil() != null) {
            String foto = request.getFotoPerfil().trim();

            if (foto.isBlank()) {
                usuario.setFotoPerfil(null);
            } else {
                validarFormatoFotoBase64(foto);
                validarTamanoFotoBase64(foto);
                usuario.setFotoPerfil(foto);
            }
        }

        boolean cambioCampus = request.getCampusId() != null;
        boolean cambioCarrera = request.getCarreraId() != null;

        if (cambioCampus || cambioCarrera) {
            Long campusId = cambioCampus
                    ? request.getCampusId()
                    : usuario.getCampusCarrera().getCampus().getId();

            Long carreraId = cambioCarrera
                    ? request.getCarreraId()
                    : usuario.getCampusCarrera().getCarrera().getId();

            CampusCarrera campusCarrera = campusCarreraRepository
                    .findByCampusIdAndCarreraId(campusId, carreraId)
                    .orElseThrow(() -> new IllegalArgumentException("La carrera seleccionada no pertenece al campus indicado"));

            usuario.setCampusCarrera(campusCarrera);
        }

        return mapToResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizarUsuarioSeguro(Long id, UsuarioUpdateRequest request, Authentication auth) {
        String correoAuth = auth.getName();

        Usuario usuarioAuth = usuarioRepository.findByCorreo(correoAuth)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        if (!usuarioAuth.getId().equals(id)) {
            throw new AccessDeniedException("No tienes permiso para modificar este usuario");
        }

        return actualizarUsuario(id, request);
    }

    private void validarFormatoFotoBase64(String foto) {
        if (!foto.matches("^data:image\\/(png|jpg|jpeg|webp|gif);base64,.+$")) {
            throw new IllegalArgumentException("Formato de imagen base64 inválido");
        }
    }

    private void validarTamanoFotoBase64(String foto) {
        try {
            String[] parts = foto.split(",", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("Formato de imagen base64 inválido");
            }

            byte[] bytes = Base64.getDecoder().decode(parts[1]);
            long maxBytes = 2 * 1024 * 1024;

            if (bytes.length > maxBytes) {
                throw new IllegalArgumentException("La imagen excede el tamaño permitido (2MB)");
            }
        } catch (IllegalArgumentException e) {
            if ("La imagen excede el tamaño permitido (2MB)".equals(e.getMessage())) {
                throw e;
            }
            throw new IllegalArgumentException("Imagen base64 inválida");
        }
    }

    private UsuarioResponse mapToResponse(Usuario usuario) {
        CampusCarrera cc = usuario.getCampusCarrera();

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombreUsuario(),
                usuario.getCorreo(),
                usuario.getCreadoEn(),
                usuario.getFotoPerfil(),
                usuario.getDescripcion(),
                cc != null ? cc.getId() : null,
                cc != null ? cc.getCampus().getId() : null,
                cc != null ? cc.getCampus().getNombre() : null,
                cc != null ? cc.getCarrera().getId() : null,
                cc != null ? cc.getCarrera().getNombre() : null
        );
    }
}