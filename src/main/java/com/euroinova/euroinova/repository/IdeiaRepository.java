package com.euroinova.euroinova.repository;

import com.euroinova.euroinova.model.Ideia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IdeiaRepository extends JpaRepository<Ideia, Long> {

    List<Ideia> findByUsuarioId(Long usuarioId);
    long countByUsuarioId(Long usuarioId);
    long countByUsuarioIdAndStatus(Long usuarioId, String status);
    @Query("SELECT SUM(i.votos + i.comentarios) FROM Ideia i WHERE i.usuarioId = :usuarioId")
    Long sumContribuicoesByUsuarioId(Long usuarioId);

    // --- NOVO MÉTODO ---
    // Encontra as 3 primeiras (Top3) ordenando por Votos em ordem Decrescente (Desc)
    List<Ideia> findTop3ByOrderByVotosDesc();

    long countByStatus(String status);
    @Query("SELECT SUM(i.votos) FROM Ideia i")
    Long getTotalVotos();

    @Query("SELECT SUM(i.comentarios) FROM Ideia i")
    Long getTotalComentarios();
}