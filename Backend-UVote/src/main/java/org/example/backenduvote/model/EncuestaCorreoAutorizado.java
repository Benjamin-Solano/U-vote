package org.example.backenduvote.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "encuesta_correos_autorizados",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_encuesta_correo",
                        columnNames = {"encuesta_id", "correo"}
                )
        }
)
public class EncuestaCorreoAutorizado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encuesta_id", nullable = false)
    private Long encuestaId;

    @Column(name = "correo", nullable = false, length = 100)
    private String correo;

    @Column(name = "ya_voto", nullable = false)
    private boolean yaVoto;

    @Column(name = "creado_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime creadoEn;

    public EncuestaCorreoAutorizado() {}

    @PrePersist
    protected void onCreate() {
        if (creadoEn == null) {
            creadoEn = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getEncuestaId() {
        return encuestaId;
    }

    public void setEncuestaId(Long encuestaId) {
        this.encuestaId = encuestaId;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public boolean isYaVoto() {
        return yaVoto;
    }

    public void setYaVoto(boolean yaVoto) {
        this.yaVoto = yaVoto;
    }

    public OffsetDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(OffsetDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}