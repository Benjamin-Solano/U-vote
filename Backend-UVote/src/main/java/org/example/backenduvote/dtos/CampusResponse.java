package org.example.backenduvote.dtos;

public class CampusResponse {

    private Long id;
    private String nombre;

    public CampusResponse() {}

    public CampusResponse(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
