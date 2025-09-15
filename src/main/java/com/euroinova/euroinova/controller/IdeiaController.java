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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ideias")
public class IdeiaController {

    @Autowired
    private IdeiaRepository ideiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VotoRepository votoRepository;

    // Endpoint para a lista de ideias do dashboard do usuário
    @GetMapping
    public List<Ideia> listarIdeiasPorUsuario(@RequestParam Long usuarioId) {
        return ideiaRepository.findByUsuarioId(usuarioId);
    }

    // Endpoint para a página "Explorar"
    @GetMapping("/todas")
    public List<Ideia> listarTodasOrdenado() {
        return ideiaRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // Endpoint para criar uma nova ideia
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

    // Endpoint para votar ou desvotar em uma ideia
    @PostMapping("/{ideiaId}/votar")
    public ResponseEntity<Ideia> votarNaIdeia(@PathVariable Long ideiaId, @RequestParam Long usuarioId) {

        Optional<Ideia> ideiaOpt = ideiaRepository.findById(ideiaId);
        if (ideiaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Voto> votoExistente = votoRepository.findByUsuarioIdAndIdeiaId(usuarioId, ideiaId);

        Ideia ideia = ideiaOpt.get();

        if (votoExistente.isPresent()) {
            // Se o voto JÁ EXISTE, remove o voto (descurtir)
            votoRepository.delete(votoExistente.get());
            ideia.setVotos(ideia.getVotos() - 1);
        } else {
            // Se o voto NÃO EXISTE, adiciona o voto (curtir)
            Voto novoVoto = new Voto(usuarioId, ideiaId);
            votoRepository.save(novoVoto);
            ideia.setVotos(ideia.getVotos() + 1);
        }

        Ideia ideiaAtualizada = ideiaRepository.save(ideia);
        return ResponseEntity.ok(ideiaAtualizada);
    }
}