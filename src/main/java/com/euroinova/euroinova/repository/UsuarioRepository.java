package com.euroinova.euroinova.repository;

import com.euroinova.euroinova.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailCorporativoOrRa(String email, String ra);

    // --- NOVO MÉTODO ADICIONADO ABAIXO ---
    /**
     * Verifica se já existe um usuário com o mesmo RA ou E-mail.
     * @param ra O RA a ser verificado.
     * @param email O e-mail a ser verificado.
     * @return true se um usuário for encontrado, false caso contrário.
     */
    boolean existsByRaOrEmailCorporativo(String ra, String email);
}