package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.repository.ComentarioRepository;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @Autowired
    private VotoRepository votoRepository;

    @Autowired
    private ComentarioRepository comentarioRepository;

    // Endpoint para a tabela de gerenciamento de ideias
    @GetMapping("/ideias")
    public List<Ideia> listarTodasIdeias() {
        return ideiaRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // EndPoint para dados do gráfico
    @GetMapping("/stats/status-distribution")
    public ResponseEntity<Map<String, Long>> getStatusDistribution() {
        long aprovadas = ideiaRepository.countByStatus("Aprovada");
        long pendentes = ideiaRepository.countByStatus("Pendente");
        long rejeitadas = ideiaRepository.countByStatus("Rejeitada");

        Map<String, Long> stats = Map.of(
                "aprovadas", aprovadas,
                "pendentes", pendentes,
                "rejeitadas", rejeitadas
        );
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/stats/global")
    public ResponseEntity<Map<String, Long>> getGlobalStats() {
        Long totalVotos = ideiaRepository.getTotalVotos();
        Long totalComentarios = ideiaRepository.getTotalComentarios();

        Map<String, Long> stats = Map.of(
                "totalCurtidas", totalVotos != null ? totalVotos : 0,
                "totalComentarios", totalComentarios != null ? totalComentarios : 0
        );
        return ResponseEntity.ok(stats);
    }
    @PutMapping("/ideias/{id}/status")
    public ResponseEntity<Ideia> atualizarStatusIdeia(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String novoStatus = statusUpdate.get("status");
        if (novoStatus == null || novoStatus.isEmpty()) {
            return ResponseEntity.badRequest().build(); // Retorna erro se o status não for enviado
        }

        return ideiaRepository.findById(id)
                .map(ideia -> {
                    ideia.setStatus(novoStatus);
                    Ideia ideiaAtualizada = ideiaRepository.save(ideia);
                    return ResponseEntity.ok(ideiaAtualizada);
                }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/ideias/{id}")
    public ResponseEntity<?> deletarIdeia(@PathVariable Long id) {
        return ideiaRepository.findById(id)
                .map(ideia -> {
                    // 1. Exclui todos os votos associados
                    votoRepository.deleteByIdeiaId(id);
                    // 2. Exclui todos os comentários associados
                    comentarioRepository.deleteByIdeiaId(id);
                    // 3. Exclui a ideia
                    ideiaRepository.delete(ideia);
                    return ResponseEntity.ok().build(); // Retorna 200 OK sem corpo
                }).orElse(ResponseEntity.notFound().build());
    }
}