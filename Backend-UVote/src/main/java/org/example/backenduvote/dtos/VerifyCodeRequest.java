package org.example.backenduvote.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class VerifyCodeRequest {
    @NotBlank @Email
    private String correo;

    @NotBlank
    private String codigo;

    public String getCorreo() { return correo; }
    public String getCodigo() { return codigo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
}
