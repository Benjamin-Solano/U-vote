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

    private Long campusCarreraId;
    private Long campusId;
    private String campusNombre;
    private Long carreraId;
    private String carreraNombre;

    private String usuarioNombre;
    private boolean yaVoto;

    // NUEVOS
    private boolean usaListaCorreos;
    private long cantidadCorreosAutorizados;

    public EncuestaResponse() {}

    public EncuestaResponse(Long id,
                            Long usuarioId,
                            String nombre,
                            String descripcion,
                            String imagenUrl,
                            OffsetDateTime creadaEn,
                            OffsetDateTime fechaInicio,
                            OffsetDateTime fechaCierre,
                            boolean cerrada,
                            Long campusCarreraId,
                            Long campusId,
                            String campusNombre,
                            Long carreraId,
                            String carreraNombre) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.creadaEn = creadaEn;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.cerrada = cerrada;
        this.campusCarreraId = campusCarreraId;
        this.campusId = campusId;
        this.campusNombre = campusNombre;
        this.carreraId = carreraId;
        this.carreraNombre = carreraNombre;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public OffsetDateTime getCreadaEn() { return creadaEn; }
    public OffsetDateTime getFechaCierre() { return fechaCierre; }
    public boolean isCerrada() { return cerrada; }
    public String getImagenUrl() { return imagenUrl; }
    public OffsetDateTime getFechaInicio() { return fechaInicio; }
    public Long getCampusCarreraId() { return campusCarreraId; }
    public Long getCampusId() { return campusId; }
    public String getCampusNombre() { return campusNombre; }
    public Long getCarreraId() { return carreraId; }
    public String getCarreraNombre() { return carreraNombre; }

    public void setId(Long id) { this.id = id; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setCreadaEn(OffsetDateTime creadaEn) { this.creadaEn = creadaEn; }
    public void setFechaCierre(OffsetDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public void setCerrada(boolean cerrada) { this.cerrada = cerrada; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public void setFechaInicio(OffsetDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public void setCampusCarreraId(Long campusCarreraId) { this.campusCarreraId = campusCarreraId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }
    public void setCampusNombre(String campusNombre) { this.campusNombre = campusNombre; }
    public void setCarreraId(Long carreraId) { this.carreraId = carreraId; }
    public void setCarreraNombre(String carreraNombre) { this.carreraNombre = carreraNombre; }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public boolean isYaVoto() {
        return yaVoto;
    }

    public void setYaVoto(boolean yaVoto) {
        this.yaVoto = yaVoto;
    }

    public boolean isUsaListaCorreos() {
        return usaListaCorreos;
    }

    public void setUsaListaCorreos(boolean usaListaCorreos) {
        this.usaListaCorreos = usaListaCorreos;
    }

    public long getCantidadCorreosAutorizados() {
        return cantidadCorreosAutorizados;
    }

    public void setCantidadCorreosAutorizados(long cantidadCorreosAutorizados) {
        this.cantidadCorreosAutorizados = cantidadCorreosAutorizados;
    }
}