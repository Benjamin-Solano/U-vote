package org.example.backenduvote.dtos;

public class ResultadoOpcionDetalleResponse {

    private Long opcionId;
    private String nombre;
    private long votos;

    public ResultadoOpcionDetalleResponse() {}

    public ResultadoOpcionDetalleResponse(Long opcionId, String nombre, long votos) {
        this.opcionId = opcionId;
        this.nombre = nombre;
        this.votos = votos;
    }

    public Long getOpcionId() { return opcionId; }
    public String getNombre() { return nombre; }
    public long getVotos() { return votos; }
}
