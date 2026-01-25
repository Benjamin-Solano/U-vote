package org.example.backenduvote.dtos;

import java.time.OffsetDateTime;

public class UsuarioResponse {
    private Long id;
    private String nombreUsuario;
    private String correo;
    private OffsetDateTime creadoEn;
    private String fotoPerfil;
    private String descripcion;

    public UsuarioResponse() {}

    public UsuarioResponse(Long id, String nombreUsuario, String correo, OffsetDateTime creadoEn, String fotoPerfil, String descripcion) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.correo = correo;
        this.fotoPerfil = fotoPerfil;
        this.creadoEn = creadoEn;
        this.descripcion = descripcion;
    }

    public Long getId() {
        return id;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public String getCorreo() {
        return correo;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public String getFotoPerfil() { return fotoPerfil; }

    public String getDescripcion() { return descripcion; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }

    public void setCreadoEn(OffsetDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }


    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
