package org.example.backenduvote.model;

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

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @Column(name = "creado_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime creadoEn;


    @Column(name = "descripcion", length = 500)
    private String descripcion;


    //Verificaci[on de usuarios en registro
    @Column(name = "email_verificado", nullable = false)
    private boolean emailVerificado = false;

    @Column(name = "verif_codigo_hash", length = 255)
    private String verifCodigoHash;

    @Column(name = "verif_expira_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime verifExpiraEn;

    @Column(name = "verif_intentos", nullable = false)
    private int verifIntentos = 0;

    @Column(name = "verif_ultimo_envio", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime verifUltimoEnvio;





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
    public String getFotoPerfil() { return fotoPerfil; }
    public OffsetDateTime getCreadoEn() { return creadoEn;}
    public String getDescripcion() { return descripcion; }


    // Sets
    public void setId(Long id) { this.id = id;}
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario;}
    public void setCorreo(String correo) { this.correo = correo;}
    public void setContrasenaHash(String contrasenaHash) { this.contrasenaHash = contrasenaHash;}
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn;}
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }


    public boolean isEmailVerificado() {
        return emailVerificado;
    }

    public void setEmailVerificado(boolean emailVerificado) {
        this.emailVerificado = emailVerificado;
    }

    public String getVerifCodigoHash() {
        return verifCodigoHash;
    }

    public void setVerifCodigoHash(String verifCodigoHash) {
        this.verifCodigoHash = verifCodigoHash;
    }

    public OffsetDateTime getVerifExpiraEn() {
        return verifExpiraEn;
    }

    public void setVerifExpiraEn(OffsetDateTime verifExpiraEn) {
        this.verifExpiraEn = verifExpiraEn;
    }

    public int getVerifIntentos() {
        return verifIntentos;
    }

    public void setVerifIntentos(int verifIntentos) {
        this.verifIntentos = verifIntentos;
    }

    public OffsetDateTime getVerifUltimoEnvio() {
        return verifUltimoEnvio;
    }

    public void setVerifUltimoEnvio(OffsetDateTime verifUltimoEnvio) {
        this.verifUltimoEnvio = verifUltimoEnvio;
    }
}
