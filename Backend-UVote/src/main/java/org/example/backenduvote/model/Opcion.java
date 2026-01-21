package org.example.backenduvote.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "opciones",
        uniqueConstraints = {
                @UniqueConstraint(name = "opcion_unica_por_encuesta", columnNames = {"encuesta_id", "nombre"})
        }
)
public class Opcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encuesta_id", nullable = false)
    private Long encuestaId;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column
    private Integer orden;

    public Opcion() {}

    public Long getId() { return id; }

    public Long getEncuestaId() { return encuestaId; }
    public void setEncuestaId(Long encuestaId) { this.encuestaId = encuestaId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }
}
