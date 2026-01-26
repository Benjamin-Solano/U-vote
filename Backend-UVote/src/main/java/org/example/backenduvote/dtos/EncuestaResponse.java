package org.example.backenduvote.dtos;

import java.time.OffsetDateTime;

public class EncuestaResponse {

    private Long id;
    private Long usuarioId;
    private String nombre;
    private String descripcion;
    private OffsetDateTime creadaEn;
    private OffsetDateTime fechaCierre;
    private boolean cerrada;
    private String imagenUrl;
    private OffsetDateTime fechaInicio;

    public EncuestaResponse() {}

    public EncuestaResponse(Long id, Long usuarioId, String nombre, String descripcion,
                            String imagenUrl, OffsetDateTime creadaEn,
                            OffsetDateTime fechaInicio, OffsetDateTime fechaCierre, boolean cerrada) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.creadaEn = creadaEn;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.cerrada = cerrada;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public OffsetDateTime getCreadaEn() { return creadaEn; }
    public OffsetDateTime getFechaCierre() { return fechaCierre; }
    public boolean isCerrada() { return cerrada; }
    public OffsetDateTime getFechaInicio() { return fechaInicio; }

    // getter/setter
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public void setId(Long id) { this.id = id; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCreadaEn(OffsetDateTime creadaEn) { this.creadaEn = creadaEn; }
    public void setFechaCierre(OffsetDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public void setCerrada(boolean cerrada) { this.cerrada = cerrada; }
    public void setFechaInicio(OffsetDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
}
