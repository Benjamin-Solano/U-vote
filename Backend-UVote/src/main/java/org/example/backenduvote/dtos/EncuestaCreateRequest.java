package org.example.backenduvote.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EncuestaCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Size(max = 1000)
    private String descripcion;

    public EncuestaCreateRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
