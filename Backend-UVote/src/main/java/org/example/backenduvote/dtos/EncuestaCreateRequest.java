package org.example.backenduvote.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public class EncuestaCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Size(max = 1000)
    private String descripcion;

    @Size(max = 5000000)
    private String imagenUrl;

    private OffsetDateTime inicio;
    private OffsetDateTime cierre;

    public EncuestaCreateRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }


    public OffsetDateTime getInicio() { return inicio; }
    public void setInicio(OffsetDateTime fechaInicio) { this.inicio = fechaInicio; }

    public OffsetDateTime getCierre() { return cierre; }
    public void setFechaCierre(OffsetDateTime fechaCierre) { this.cierre = fechaCierre; }
}

