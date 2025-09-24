package com.euroinova.euroinova.repository;

import com.euroinova.euroinova.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    // Encontra todas as notificações de um usuário específico,
    // ordenadas da mais recente para a mais antiga.
    List<Notificacao> findByUsuarioIdOrderByIdDesc(Long usuarioId);

}