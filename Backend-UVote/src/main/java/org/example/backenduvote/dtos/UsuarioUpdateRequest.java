package org.example.backenduvote.dtos;

import jakarta.validation.constraints.Size;

public class UsuarioUpdateRequest {

    @Size(min = 3, max = 100)
    private String nombreUsuario;

    @Size(max = 500)
    private String fotoPerfil;

    @Size(max = 500)
    private String descripcion;

    private Long campusId;
    private Long carreraId;

    public UsuarioUpdateRequest() {}

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getCampusId() {
        return campusId;
    }

    public void setCampusId(Long campusId) {
        this.campusId = campusId;
    }

    public Long getCarreraId() {
        return carreraId;
    }

    public void setCarreraId(Long carreraId) {
        this.carreraId = carreraId;
    }
}