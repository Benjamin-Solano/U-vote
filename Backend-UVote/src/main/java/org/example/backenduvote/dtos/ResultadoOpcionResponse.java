package org.example.backenduvote.dtos;

public class ResultadoOpcionResponse {

    private Long opcionId;
    private long votos;

    public ResultadoOpcionResponse() {}

    public ResultadoOpcionResponse(Long opcionId, long votos) {
        this.opcionId = opcionId;
        this.votos = votos;
    }

    public Long getOpcionId() { return opcionId; }
    public long getVotos() { return votos; }
}
