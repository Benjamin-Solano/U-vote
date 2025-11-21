package org.example.backenduvote.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Nota: Aqui estoy tomando unicamente el nombre, correo y contrase;a,
//       No necesito que ninguna API o el resto de la aplicacion sepa
//       algo mas del usuario...

public class UsuarioRegistroRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String nombreUsuario;

    @NotBlank
    @Email
    @Size(max = 100)
    private String correo;

    @NotBlank
    @Size(min = 8, max = 72) // 72 es buen límite para BCrypt
    private String contrasena;

    public UsuarioRegistroRequest() {}

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
