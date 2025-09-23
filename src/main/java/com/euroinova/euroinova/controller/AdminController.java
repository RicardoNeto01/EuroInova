package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.repository.ComentarioRepository;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @Autowired
    private VotoRepository votoRepository;

    @Autowired
    private ComentarioRepository comentarioRepository;

    @GetMapping("/ideias")
    public List<Ideia> listarTodasIdeias(
            @RequestParam(required = false, defaultValue = "recentes") String ordenarPor,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String status) {

        List<Ideia> todasIdeias = ideiaRepository.findAll();

        // Filtra a lista em memória
        List<Ideia> ideiasFiltradas = todasIdeias.stream()
                .filter(ideia -> (departamento == null || departamento.isEmpty() || departamento.equals("Todos") || departamento.equals(ideia.getDepartamento())))
                .filter(ideia -> (status == null || status.isEmpty() || status.equals("Todos") || status.equals(ideia.getStatus())))
                .collect(Collectors.toList());

        // Ordena a lista já filtrada
        if ("votos".equals(ordenarPor)) {
            ideiasFiltradas.sort(Comparator.comparingInt(Ideia::getVotos).reversed());
        } else { // "recentes" é o padrão
            ideiasFiltradas.sort(Comparator.comparingLong(Ideia::getId).reversed());
        }

        return ideiasFiltradas;
    }

    // Endpoint para os dados do gráfico de pizza
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

    // Endpoint para os cards de estatísticas globais
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

    // Endpoint para atualizar o status de uma ideia
    @PutMapping("/ideias/{id}/status")
    public ResponseEntity<Ideia> atualizarStatusIdeia(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String novoStatus = statusUpdate.get("status");
        if (novoStatus == null || novoStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ideiaRepository.findById(id)
                .map(ideia -> {
                    ideia.setStatus(novoStatus);
                    Ideia ideiaAtualizada = ideiaRepository.save(ideia);
                    return ResponseEntity.ok(ideiaAtualizada);
                }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para excluir uma ideia
    @DeleteMapping("/ideias/{id}")
    public ResponseEntity<?> deletarIdeia(@PathVariable Long id) {
        return ideiaRepository.findById(id)
                .map(ideia -> {
                    votoRepository.deleteByIdeiaId(id);
                    comentarioRepository.deleteByIdeiaId(id);
                    ideiaRepository.delete(ideia);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}