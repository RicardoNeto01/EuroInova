package com.euroinova.euroinova.repository;

import com.euroinova.euroinova.model.Voto;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {

    // Procura por um voto específico de um usuário em uma ideia
    Optional<Voto> findByUsuarioIdAndIdeiaId(Long usuarioId, Long ideiaId);

    @Transactional
    void deleteByIdeiaId(Long ideiaId);// Necessário para operações de delete customizadas
}