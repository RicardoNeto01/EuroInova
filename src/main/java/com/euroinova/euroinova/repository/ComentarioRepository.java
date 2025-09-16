package com.euroinova.euroinova.repository;

import com.euroinova.euroinova.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Encontra todos os comentários de uma ideia específica, ordenados pelo mais recente
    List<Comentario> findByIdeiaIdOrderByIdDesc(Long ideiaId);
}