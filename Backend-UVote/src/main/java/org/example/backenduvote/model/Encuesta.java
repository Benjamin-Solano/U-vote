package org.example.backenduvote.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "encuestas")
public class Encuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK directa: usuario_id
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Column(name = "creada_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime creadaEn;

    @Column(name = "fecha_cierre", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime fechaCierre;

    public Encuesta() {}

    @PrePersist
    protected void onCreate() {
        if (creadaEn == null) {
            creadaEn = OffsetDateTime.now();
        }
    }

    public boolean estaCerrada() {
        return fechaCierre != null;
    }

    // Getters y setters

    public Long getId() { return id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public OffsetDateTime getCreadaEn() { return creadaEn; }
    public void setCreadaEn(OffsetDateTime creadaEn) { this.creadaEn = creadaEn; }

    public OffsetDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(OffsetDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
}
