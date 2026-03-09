package org.example.backenduvote.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "campus_carreras",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_campus_carrera", columnNames = {"campus_id", "carrera_id"})
        }
)
public class CampusCarrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    public CampusCarrera() {}

    public CampusCarrera(Campus campus, Carrera carrera) {
        this.campus = campus;
        this.carrera = carrera;
    }

    public Long getId() { return id; }
    public Campus getCampus() { return campus; }
    public Carrera getCarrera() { return carrera; }

    public void setId(Long id) { this.id = id; }
    public void setCampus(Campus campus) { this.campus = campus; }
    public void setCarrera(Carrera carrera) { this.carrera = carrera; }
}