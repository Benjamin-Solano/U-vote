package org.example.backenduvote.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class VotoCreateRequest {

    @NotNull
    private Long opcionId;

    @Size(max = 5000)
    private String imagenUrl;


    public VotoCreateRequest() {}

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Long getOpcionId() { return opcionId; }
    public void setOpcionId(Long opcionId) { this.opcionId = opcionId; }
}
