package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.NovaIdeiaDTO;
import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.model.Usuario;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideias")
public class IdeiaController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Ideia> listarIdeiasPorUsuario(@RequestParam Long usuarioId) {
        return ideiaRepository.findByUsuarioId(usuarioId);
    }

    @GetMapping("/todas")
    public List<Ideia> listarTodasOrdenado() {
        // Usamos Sort.by para ordenar os resultados pela coluna 'id' em ordem decrescente.
        // Como o ID é sequencial, isso efetivamente nos dá as ideias mais recentes primeiro.
        return ideiaRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
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
        novaIdeia.setDepartamento("TI");
        novaIdeia.setStatus("Pendente");
        novaIdeia.setVotos(0);
        novaIdeia.setComentarios(0);

        Ideia ideiaSalva = ideiaRepository.save(novaIdeia);

        return new ResponseEntity<>(ideiaSalva, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/votar")
    public ResponseEntity<Ideia> votarNaIdeia(@PathVariable Long id) {
        // 1. Encontra a ideia no banco de dados pelo ID
        return ideiaRepository.findById(id)
                .map(ideia -> {
                    // 2. Incrementa o contador de votos
                    ideia.setVotos(ideia.getVotos() + 1);
                    // 3. Salva a ideia atualizada de volta no banco
                    Ideia ideiaAtualizada = ideiaRepository.save(ideia);
                    // 4. Retorna a ideia com o novo número de votos
                    return ResponseEntity.ok(ideiaAtualizada);
                })
                // Se não encontrar a ideia, retorna um erro 404 Not Found
                .orElse(ResponseEntity.notFound().build());
    }

}