package repository;

import model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Nota: En los repositorios van los metodos relacionados a las clases
//       casi como un CRUD...

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByCorreo(String email);

    boolean existsByNombreUsuario(String nombre);

    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByNombreUsuario(String nombre);

}
