package org.example.backenduvote.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CarreraRequest {

    @NotBlank
    @Size(max = 150)
    private String nombre;

    public CarreraRequest() {}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}