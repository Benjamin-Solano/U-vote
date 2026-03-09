package org.example.backenduvote.dtos;

public class CampusCarreraResponse {

    private Long campusCarreraId;
    private Long campusId;
    private String campusNombre;
    private Long carreraId;
    private String carreraNombre;

    public CampusCarreraResponse() {}

    public CampusCarreraResponse(Long campusCarreraId,
                                 Long campusId,
                                 String campusNombre,
                                 Long carreraId,
                                 String carreraNombre) {
        this.campusCarreraId = campusCarreraId;
        this.campusId = campusId;
        this.campusNombre = campusNombre;
        this.carreraId = carreraId;
        this.carreraNombre = carreraNombre;
    }

    public Long getCampusCarreraId() { return campusCarreraId; }
    public Long getCampusId() { return campusId; }
    public String getCampusNombre() { return campusNombre; }
    public Long getCarreraId() { return carreraId; }
    public String getCarreraNombre() { return carreraNombre; }

    public void setCampusCarreraId(Long campusCarreraId) { this.campusCarreraId = campusCarreraId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }
    public void setCampusNombre(String campusNombre) { this.campusNombre = campusNombre; }
    public void setCarreraId(Long carreraId) { this.carreraId = carreraId; }
    public void setCarreraNombre(String carreraNombre) { this.carreraNombre = carreraNombre; }
}