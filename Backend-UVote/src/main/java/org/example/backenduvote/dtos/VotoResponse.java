package org.example.backenduvote.dtos;

import java.time.OffsetDateTime;

public class VotoResponse {

    private Long id;
    private Long usuarioId;
    private Long encuestaId;
    private Long opcionId;
    private OffsetDateTime creadoEn;

    public VotoResponse() {}

    public VotoResponse(Long id, Long usuarioId, Long encuestaId, Long opcionId, OffsetDateTime creadoEn) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.encuestaId = encuestaId;
        this.opcionId = opcionId;
        this.creadoEn = creadoEn;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public Long getEncuestaId() { return encuestaId; }
    public Long getOpcionId() { return opcionId; }
    public OffsetDateTime getCreadoEn() { return creadoEn; }
}
