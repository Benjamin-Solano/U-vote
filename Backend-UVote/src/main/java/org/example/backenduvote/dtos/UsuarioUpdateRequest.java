package org.example.backenduvote.dtos;

import jakarta.validation.constraints.Size;

public class UsuarioUpdateRequest {

    @Size(min = 3, max = 100)
    private String nombreUsuario;

    @Size(max = 500)
    private String fotoPerfil;

    public UsuarioUpdateRequest() {}

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
}
