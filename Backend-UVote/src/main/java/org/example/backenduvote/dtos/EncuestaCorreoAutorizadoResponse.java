package org.example.backenduvote.dtos;

public class EncuestaCorreoAutorizadoResponse {

    private Long id;
    private Long encuestaId;
    private String correo;
    private boolean yaVoto;

    public EncuestaCorreoAutorizadoResponse() {}

    public EncuestaCorreoAutorizadoResponse(Long id, Long encuestaId, String correo, boolean yaVoto) {
        this.id = id;
        this.encuestaId = encuestaId;
        this.correo = correo;
        this.yaVoto = yaVoto;
    }

    public Long getId() {
        return id;
    }

    public Long getEncuestaId() {
        return encuestaId;
    }

    public String getCorreo() {
        return correo;
    }

    public boolean isYaVoto() {
        return yaVoto;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEncuestaId(Long encuestaId) {
        this.encuestaId = encuestaId;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setYaVoto(boolean yaVoto) {
        this.yaVoto = yaVoto;
    }
}