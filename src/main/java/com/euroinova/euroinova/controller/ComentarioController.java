package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.NovoComentarioDTO;
import com.euroinova.euroinova.model.Comentario;
import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.model.Usuario;
import com.euroinova.euroinova.repository.ComentarioRepository;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideias/{ideiaId}/comentarios")
public class ComentarioController {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IdeiaRepository ideiaRepository;

    // Endpoint para BUSCAR todos os comentários de uma ideia
    @GetMapping
    public List<Comentario> buscarComentariosPorIdeia(@PathVariable Long ideiaId) {
        return comentarioRepository.findByIdeiaIdOrderByIdDesc(ideiaId);
    }

    // Endpoint para ADICIONAR um novo comentário a uma ideia
    @PostMapping
    public ResponseEntity<Comentario> adicionarComentario(@PathVariable Long ideiaId,
                                                          @RequestParam Long usuarioId,
                                                          @RequestBody NovoComentarioDTO comentarioDTO) {
        Usuario autor = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        // Atualiza o contador de comentários na ideia
        Ideia ideia = ideiaRepository.findById(ideiaId)
                .orElseThrow(() -> new RuntimeException("Ideia não encontrada!"));
        ideia.setComentarios(ideia.getComentarios() + 1);
        ideiaRepository.save(ideia);

        Comentario novoComentario = new Comentario();
        novoComentario.setTexto(comentarioDTO.getTexto());
        novoComentario.setIdeiaId(ideiaId);
        novoComentario.setUsuarioId(usuarioId);
        novoComentario.setAutorNome(autor.getNome());

        Comentario comentarioSalvo = comentarioRepository.save(novoComentario);
        return new ResponseEntity<>(comentarioSalvo, HttpStatus.CREATED);
    }
}