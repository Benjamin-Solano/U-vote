package org.example.backenduvote.dtos;

import java.util.ArrayList;
import java.util.List;

public class CargaCorreosResponse {

    private int totalLeidos;
    private int totalValidos;
    private int totalInvalidos;
    private int totalDuplicados;
    private int totalGuardados;
    private List<String> correosInvalidos = new ArrayList<>();

    public CargaCorreosResponse() {}

    public CargaCorreosResponse(int totalLeidos,
                                int totalValidos,
                                int totalInvalidos,
                                int totalDuplicados,
                                int totalGuardados,
                                List<String> correosInvalidos) {
        this.totalLeidos = totalLeidos;
        this.totalValidos = totalValidos;
        this.totalInvalidos = totalInvalidos;
        this.totalDuplicados = totalDuplicados;
        this.totalGuardados = totalGuardados;
        this.correosInvalidos = correosInvalidos;
    }

    public int getTotalLeidos() {
        return totalLeidos;
    }

    public void setTotalLeidos(int totalLeidos) {
        this.totalLeidos = totalLeidos;
    }

    public int getTotalValidos() {
        return totalValidos;
    }

    public void setTotalValidos(int totalValidos) {
        this.totalValidos = totalValidos;
    }

    public int getTotalInvalidos() {
        return totalInvalidos;
    }

    public void setTotalInvalidos(int totalInvalidos) {
        this.totalInvalidos = totalInvalidos;
    }

    public int getTotalDuplicados() {
        return totalDuplicados;
    }

    public void setTotalDuplicados(int totalDuplicados) {
        this.totalDuplicados = totalDuplicados;
    }

    public int getTotalGuardados() {
        return totalGuardados;
    }

    public void setTotalGuardados(int totalGuardados) {
        this.totalGuardados = totalGuardados;
    }

    public List<String> getCorreosInvalidos() {
        return correosInvalidos;
    }

    public void setCorreosInvalidos(List<String> correosInvalidos) {
        this.correosInvalidos = correosInvalidos;
    }
}