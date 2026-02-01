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

    // Foto/portada de la encuesta
    @Column(name = "imagen_url")
    private String imagenUrl;

    // Inicio efectivo
    @Column(name = "fecha_inicio", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime fechaInicio;

    public Encuesta() {}

    @PrePersist
    protected void onCreate() {
        if (creadaEn == null) creadaEn = OffsetDateTime.now();
        if (fechaInicio == null) fechaInicio = creadaEn; // abre desde creada_en si no se especifica
    }

    public boolean estaCerrada() {
        return estaCerradaEn(OffsetDateTime.now());
    }

    public boolean estaCerradaEn(OffsetDateTime ahora) {
        if (ahora == null) ahora = OffsetDateTime.now();
        return fechaCierre != null && !ahora.isBefore(fechaCierre);
    }


    public boolean noHaIniciadoAun(OffsetDateTime ahora) {
        if (ahora == null) ahora = OffsetDateTime.now();
        return fechaInicio != null && ahora.isBefore(fechaInicio);
    }

    public boolean estaActivaEn(OffsetDateTime ahora) {
        if (ahora == null) ahora = OffsetDateTime.now();

        if (fechaInicio != null && ahora.isBefore(fechaInicio)) return false;
        if (fechaCierre != null && !ahora.isBefore(fechaCierre)) return false;

        return true;
    }


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

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public OffsetDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(OffsetDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
}



