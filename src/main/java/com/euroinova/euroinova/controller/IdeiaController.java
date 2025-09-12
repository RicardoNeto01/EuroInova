package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.NovaIdeiaDTO;
import com.euroinova.euroinova.model.Ideia;
import com.euroinova.euroinova.model.Usuario;
import com.euroinova.euroinova.repository.IdeiaRepository;
import com.euroinova.euroinova.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    // O método @PostConstruct foi removido daqui.
}