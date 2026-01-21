package org.example.backenduvote.dtos;

public class OpcionResponse {

    private Long id;
    private Long encuestaId;
    private String nombre;
    private String descripcion;
    private String imagenUrl;
    private Integer orden;

    public OpcionResponse() {}

    public OpcionResponse(Long id, Long encuestaId, String nombre, String descripcion, String imagenUrl, Integer orden) {
        this.id = id;
        this.encuestaId = encuestaId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.orden = orden;
    }

    public Long getId() { return id; }
    public Long getEncuestaId() { return encuestaId; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public String getImagenUrl() { return imagenUrl; }
    public Integer getOrden() { return orden; }

    public void setId(Long id) { this.id = id; }
    public void setEncuestaId(Long encuestaId) { this.encuestaId = encuestaId; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public void setOrden(Integer orden) { this.orden = orden; }
}
