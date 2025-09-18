package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.DashboardStatsDTO;
import com.euroinova.euroinova.model.Ideia; // Importe a entidade Ideia
import com.euroinova.euroinova.repository.IdeiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List; // Importe List

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats(@RequestParam Long usuarioId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setMinhasIdeias(ideiaRepository.countByUsuarioId(usuarioId));
        stats.setIdeiasAprovadas(ideiaRepository.countByUsuarioIdAndStatus(usuarioId, "Aprovada"));
        stats.setIdeiasPendentes(ideiaRepository.countByUsuarioIdAndStatus(usuarioId, "Pendente"));
        Long totalContribuicoes = ideiaRepository.sumContribuicoesByUsuarioId(usuarioId);
        stats.setContribuicoes(totalContribuicoes != null ? totalContribuicoes : 0);
        return stats;
    }

    @GetMapping("/top-ideias")
    public List<Ideia> getTopIdeias() {
        return ideiaRepository.findTop3ByOrderByVotosDesc();
    }
}