package dtos;

import java.time.OffsetDateTime;

public class UsuarioResponse {
    private Long id;
    private String nombreUsuario;
    private String correo;
    private OffsetDateTime creadoEn;

    public UsuarioResponse() {}

    public UsuarioResponse(Long id, String nombreUsuario, String correo, OffsetDateTime creadoEn) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.correo = correo;
        this.creadoEn = creadoEn;
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setCreadoEn(OffsetDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}
