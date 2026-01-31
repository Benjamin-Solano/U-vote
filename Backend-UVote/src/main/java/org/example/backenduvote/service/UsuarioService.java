package org.example.backenduvote.service;

import org.example.backenduvote.dtos.UsuarioRegistroRequest;
import org.example.backenduvote.dtos.UsuarioResponse;
import org.example.backenduvote.dtos.UsuarioUpdateRequest;
import org.example.backenduvote.model.Usuario;
import org.example.backenduvote.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // ✅ Nuevo: OTP
    private final VerificationCodeService verificationCodeService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          VerificationCodeService verificationCodeService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationCodeService = verificationCodeService;
    }

    // -------------------------
    // Registro
    // -------------------------
    public UsuarioResponse registrarUsuario(UsuarioRegistroRequest request) {

        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre del usuario ya existe");
        }

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(request.getNombreUsuario());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasenaHash(passwordEncoder.encode(request.getContrasena()));

        // fotoPerfil: normalmente null en registro
        usuario.setFotoPerfil(null);

        // ✅ Estado inicial: no verificado
        usuario.setEmailVerificado(false);

        Usuario saved = usuarioRepository.save(usuario);

        // ✅ Enviar OTP (primer envío)
        verificationCodeService.generarYEnviarCodigo(saved, false);

        return mapToResponse(saved);
    }

    // -------------------------
    // Listar / Obtener
    // -------------------------
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

    // -------------------------
    // Eliminar
    // -------------------------
    @Transactional
    public void eliminarPorId(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario no existe");
        }
        usuarioRepository.deleteById(id);
    }

    // -------------------------
    // Actualizar nombre de usuario / datos
    // -------------------------
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

        return mapToResponse(usuarioRepository.save(usuario));
    }

    // -------------------------
    // Subir foto de perfil (Multipart) - Opción 1
    // -------------------------
    @Transactional
    public UsuarioResponse actualizarFotoPerfil(Long id, MultipartFile file) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Solo se permiten imágenes");
        }

        // 2MB (ajústalo si quieres)
        long maxBytes = 2 * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("La imagen excede el tamaño permitido (2MB)");
        }

        // Nombre seguro + extensión
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "imagen" : file.getOriginalFilename());
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot);

        String filename = "u_" + id + "_" + UUID.randomUUID() + ext;

        // Directorio real donde se guarda: <app.upload-dir>/profile
        Path dir = Paths.get(uploadDir, "profile").toAbsolutePath().normalize();

        try {
            Files.createDirectories(dir);

            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar la imagen", e);
        }

        // ✅ URL pública servida por FileController
        String publicUrl = "/api/files/profile/" + filename;

        usuario.setFotoPerfil(publicUrl);
        usuarioRepository.save(usuario);

        return mapToResponse(usuario);
    }

    // -------------------------
    // Seguridad: solo el dueño puede actualizarse
    // -------------------------
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

    @Transactional
    public UsuarioResponse actualizarFotoPerfilSeguro(Long id, MultipartFile file, Authentication auth) {
        String correoAuth = auth.getName();

        Usuario usuarioAuth = usuarioRepository.findByCorreo(correoAuth)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        if (!usuarioAuth.getId().equals(id)) {
            throw new AccessDeniedException("No tienes permiso para modificar este usuario");
        }

        return actualizarFotoPerfil(id, file);
    }

    // -------------------------
    // Mapper
    // -------------------------
    private UsuarioResponse mapToResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombreUsuario(),
                usuario.getCorreo(),
                usuario.getCreadoEn(),
                usuario.getFotoPerfil(),
                usuario.getDescripcion()
        );
    }
}
