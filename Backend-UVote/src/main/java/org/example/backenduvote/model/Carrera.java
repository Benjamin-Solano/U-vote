package org.example.backenduvote.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carreras")
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true, length = 300)
    private String nombre;

    @OneToMany(mappedBy = "carrera")
    private List<CampusCarrera> campusCarreras = new ArrayList<>();

    public Carrera() {}

    public Carrera(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Carrera(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public List<CampusCarrera> getCampusCarreras() { return campusCarreras; }

    public void setId(Long id) { this.id = id; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setCampusCarreras(List<CampusCarrera> campusCarreras) { this.campusCarreras = campusCarreras; }
}