package org.example.backenduvote.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "votos",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "voto_unico_por_usuario_encuesta",
                        columnNames = {"usuario_id", "encuesta_id"}
                )
        }
)
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "encuesta_id", nullable = false)
    private Long encuestaId;

    @Column(name = "opcion_id", nullable = false)
    private Long opcionId;

    @Column(name = "creado_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime creadoEn;

    public Voto() {}

    @PrePersist
    protected void onCreate() {
        if (creadoEn == null) {
            creadoEn = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Long getEncuestaId() { return encuestaId; }
    public void setEncuestaId(Long encuestaId) { this.encuestaId = encuestaId; }

    public Long getOpcionId() { return opcionId; }
    public void setOpcionId(Long opcionId) { this.opcionId = opcionId; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }
}
