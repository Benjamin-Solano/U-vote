package org.example.backenduvote.dtos;

import jakarta.validation.constraints.NotNull;

public class VotoCreateRequest {

    @NotNull
    private Long opcionId;

    public VotoCreateRequest() {}

    public Long getOpcionId() { return opcionId; }
    public void setOpcionId(Long opcionId) { this.opcionId = opcionId; }
}
