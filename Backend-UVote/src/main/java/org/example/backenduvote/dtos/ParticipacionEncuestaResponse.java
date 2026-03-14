package org.example.backenduvote.dtos;

public class ParticipacionEncuestaResponse {

    private long totalAutorizados;
    private long totalYaVotaron;
    private long totalPendientes;

    public ParticipacionEncuestaResponse() {}

    public ParticipacionEncuestaResponse(long totalAutorizados, long totalYaVotaron, long totalPendientes) {
        this.totalAutorizados = totalAutorizados;
        this.totalYaVotaron = totalYaVotaron;
        this.totalPendientes = totalPendientes;
    }

    public long getTotalAutorizados() {
        return totalAutorizados;
    }

    public void setTotalAutorizados(long totalAutorizados) {
        this.totalAutorizados = totalAutorizados;
    }

    public long getTotalYaVotaron() {
        return totalYaVotaron;
    }

    public void setTotalYaVotaron(long totalYaVotaron) {
        this.totalYaVotaron = totalYaVotaron;
    }

    public long getTotalPendientes() {
        return totalPendientes;
    }

    public void setTotalPendientes(long totalPendientes) {
        this.totalPendientes = totalPendientes;
    }
}