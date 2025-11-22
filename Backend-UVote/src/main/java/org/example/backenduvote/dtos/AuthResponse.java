package org.example.backenduvote.dtos;

public class AuthResponse {

    private String token;
    private UsuarioResponse usuario;

    public AuthResponse() {}

    public AuthResponse(String token, UsuarioResponse usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public UsuarioResponse getUsuario() {
        return usuario;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setUsuario(UsuarioResponse usuario) {
        this.usuario = usuario;
    }
}
