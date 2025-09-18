package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.NovaIdeiaDTO;
import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.model.Usuario;
import com.euroinova.euroinova.model.Voto;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.UsuarioRepository;
import com.euroinova.euroinova.repository.VotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ideias")
public class IdeiaController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VotoRepository votoRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Ideia> buscarIdeiaPorId(@PathVariable Long id, @RequestParam Long usuarioId) {
        Optional<Ideia> ideiaOpt = ideiaRepository.findById(id);

        if (ideiaOpt.isPresent()) {
            Ideia ideia = ideiaOpt.get();
            boolean votado = votoRepository.findByUsuarioIdAndIdeiaId(usuarioId, ideia.getId()).isPresent();
            ideia.setVotadoPeloUsuarioAtual(votado);
            return ResponseEntity.ok(ideia);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public List<Ideia> listarIdeiasPorUsuario(@RequestParam Long usuarioId) {
        List<Ideia> ideias = ideiaRepository.findByUsuarioId(usuarioId);
        marcarIdeiasVotadas(usuarioId, ideias);
        return ideias;
    }
    private void marcarIdeiasVotadas(Long usuarioId, List<Ideia> ideias) {
        for (Ideia ideia : ideias) {
            boolean votado = votoRepository.findByUsuarioIdAndIdeiaId(usuarioId, ideia.getId()).isPresent();
            ideia.setVotadoPeloUsuarioAtual(votado);
        }
    }

    // --- ENDPOINT ATUALIZADO PARA A PÁGINA EXPLORAR ---
    @GetMapping("/todas")
    public List<Ideia> listarTodasOrdenado(
            @RequestParam Long usuarioId,
            @RequestParam(required = false, defaultValue = "recentes") String ordenarPor,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String status) { // NOVO PARÂMETRO

        // 1. Busca todas as ideias
        List<Ideia> todasIdeias = ideiaRepository.findAll();

        // 2. Filtra por departamento e status usando Java Streams
        List<Ideia> ideiasFiltradas = todasIdeias.stream()
                .filter(ideia -> {
                    // Filtro de departamento
                    boolean correspondeDepartamento = (departamento == null || departamento.isEmpty() || departamento.equals("Todos"))
                            || departamento.equals(ideia.getDepartamento());
                    // Filtro de status
                    boolean correspondeStatus = (status == null || status.isEmpty() || status.equals("Todos"))
                            || status.equals(ideia.getStatus());
                    return correspondeDepartamento && correspondeStatus;
                })
                .collect(Collectors.toList());

        // 3. Ordena a lista já filtrada
        if ("votos".equals(ordenarPor)) {
            ideiasFiltradas.sort(Comparator.comparingInt(Ideia::getVotos).reversed());
        } else { // "recentes" é o padrão
            ideiasFiltradas.sort(Comparator.comparingLong(Ideia::getId).reversed());
        }

        // 4. Marca as ideias que o usuário atual já votou
        marcarIdeiasVotadas(usuarioId, ideiasFiltradas);

        return ideiasFiltradas;
    }

    @PostMapping
    public ResponseEntity<Ideia> criarIdeia(@RequestBody NovaIdeiaDTO novaIdeiaDTO, @RequestParam Long usuarioId) {
        Usuario autor = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        Ideia novaIdeia = new Ideia();
        novaIdeia.setTitulo(novaIdeiaDTO.getTitulo());
        novaIdeia.setDescricao(novaIdeiaDTO.getDescricao());
        novaIdeia.setUsuarioId(usuarioId);
        novaIdeia.setAutor(autor.getNome());
        novaIdeia.setDepartamento(autor.getDepartamento());
        novaIdeia.setStatus("Pendente");
        novaIdeia.setVotos(0);
        novaIdeia.setComentarios(0);
        Ideia ideiaSalva = ideiaRepository.save(novaIdeia);

        return new ResponseEntity<>(ideiaSalva, HttpStatus.CREATED);
    }

    @PostMapping("/{ideiaId}/votar")
    public ResponseEntity<Ideia> votarNaIdeia(@PathVariable Long ideiaId, @RequestParam Long usuarioId) {

        Optional<Ideia> ideiaOpt = ideiaRepository.findById(ideiaId);
        if (ideiaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Voto> votoExistente = votoRepository.findByUsuarioIdAndIdeiaId(usuarioId, ideiaId);
        Ideia ideia = ideiaOpt.get();

        if (votoExistente.isPresent()) {
            votoRepository.delete(votoExistente.get());
            ideia.setVotos(ideia.getVotos() - 1);
        } else {
            Voto novoVoto = new Voto(usuarioId, ideiaId);
            votoRepository.save(novoVoto);
            ideia.setVotos(ideia.getVotos() + 1);
        }

        Ideia ideiaAtualizada = ideiaRepository.save(ideia);
        return ResponseEntity.ok(ideiaAtualizada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ideia> atualizarIdeia(@PathVariable Long id, @RequestBody NovaIdeiaDTO ideiaDTO) {
        return ideiaRepository.findById(id)
                .map(ideia -> {
                    ideia.setTitulo(ideiaDTO.getTitulo());
                    ideia.setDescricao(ideiaDTO.getDescricao());
                    Ideia ideiaAtualizada = ideiaRepository.save(ideia);
                    return ResponseEntity.ok(ideiaAtualizada);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarIdeia(@PathVariable Long id) {
        return ideiaRepository.findById(id)
                .map(ideia -> {
                    votoRepository.deleteByIdeiaId(ideia.getId());
                    ideiaRepository.delete(ideia);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}