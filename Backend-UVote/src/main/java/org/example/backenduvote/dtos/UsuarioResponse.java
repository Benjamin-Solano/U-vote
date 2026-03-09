package org.example.backenduvote.dtos;

import java.time.OffsetDateTime;

public class UsuarioResponse {
    private Long id;
    private String nombreUsuario;
    private String correo;
    private OffsetDateTime creadoEn;
    private String fotoPerfil;
    private String descripcion;

    private Long campusCarreraId;
    private Long campusId;
    private String campusNombre;
    private Long carreraId;
    private String carreraNombre;

    public UsuarioResponse() {}

    public UsuarioResponse(Long id,
                           String nombreUsuario,
                           String correo,
                           OffsetDateTime creadoEn,
                           String fotoPerfil,
                           String descripcion,
                           Long campusCarreraId,
                           Long campusId,
                           String campusNombre,
                           Long carreraId,
                           String carreraNombre) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.correo = correo;
        this.creadoEn = creadoEn;
        this.fotoPerfil = fotoPerfil;
        this.descripcion = descripcion;
        this.campusCarreraId = campusCarreraId;
        this.campusId = campusId;
        this.campusNombre = campusNombre;
        this.carreraId = carreraId;
        this.carreraNombre = carreraNombre;
    }

    public Long getId() { return id; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getCorreo() { return correo; }
    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public String getFotoPerfil() { return fotoPerfil; }
    public String getDescripcion() { return descripcion; }
    public Long getCampusCarreraId() { return campusCarreraId; }
    public Long getCampusId() { return campusId; }
    public String getCampusNombre() { return campusNombre; }
    public Long getCarreraId() { return carreraId; }
    public String getCarreraNombre() { return carreraNombre; }

    public void setId(Long id) { this.id = id; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public void setCorreo(String correo) { this.correo = correo; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCampusCarreraId(Long campusCarreraId) { this.campusCarreraId = campusCarreraId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }
    public void setCampusNombre(String campusNombre) { this.campusNombre = campusNombre; }
    public void setCarreraId(Long carreraId) { this.carreraId = carreraId; }
    public void setCarreraNombre(String carreraNombre) { this.carreraNombre = carreraNombre; }
}