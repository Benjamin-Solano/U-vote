package model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

// Nota: Las entidades o modelos sirven para
//       mapear o hacer la primer relacion entre el backend y las tablas en la
//       Base de Datos...

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_usuario", nullable = false, unique = true)
    private String nombreUsuario;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(name = "contrasena_hash", nullable = false)
    private String contrasenaHash;

    @Column(name = "creado_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime creadoEn;

    // Validacion de OffsetDateTime
    @PrePersist
    protected void onCreate() {
        // Si no viene desde el constructor, se establece automáticamente
        if (creadoEn == null) {
            creadoEn = OffsetDateTime.now();
        }
    }
    // Constructor sin parametros
    public Usuario() {}

    // Constructor parametrizado
    public Usuario(String nombreUsuario, String correo, String contrasenaHash) {
        this.nombreUsuario = nombreUsuario;
        this.correo = correo;
        this.contrasenaHash = contrasenaHash;
        this.creadoEn = OffsetDateTime.now();
    }

    // Gets
    public Long getId() { return id; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getCorreo() { return correo;}
    public String getContrasenaHash() { return contrasenaHash;}
    public OffsetDateTime getCreadoEn() { return creadoEn;}

    // Sets
    public void setId(Long id) { this.id = id;}
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario;}
    public void setCorreo(String correo) { this.correo = correo;}
    public void setContrasenaHash(String contrasenaHash) { this.contrasenaHash = contrasenaHash;}
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn;}
}
