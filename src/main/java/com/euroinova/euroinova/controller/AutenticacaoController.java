package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.dto.RegistroDTO;
import com.euroinova.euroinova.model.Usuario;
import com.euroinova.euroinova.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injeta a ferramenta de criptografia

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroDTO registroDTO) {
        if (usuarioRepository.existsByRaOrEmailCorporativo(registroDTO.getRa(), registroDTO.getEmailCorporativo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("RA ou E-mail já cadastrado.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(registroDTO.getNome());
        novoUsuario.setRa(registroDTO.getRa());
        novoUsuario.setEmailCorporativo(registroDTO.getEmailCorporativo());
        novoUsuario.setDepartamento(registroDTO.getDepartamento());

        // Criptografa a senha antes de salvar no banco
        novoUsuario.setSenha(passwordEncoder.encode(registroDTO.getSenha()));

        novoUsuario.setRole("USER");

        usuarioRepository.save(novoUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailCorporativoOrRa(loginRequest.getLogin(), loginRequest.getLogin());

        // Verifica a senha digitada contra a senha criptografada no banco
        if (usuarioOpt.isPresent() && passwordEncoder.matches(loginRequest.getSenha(), usuarioOpt.get().getSenha())) {
            return ResponseEntity.ok(usuarioOpt.get());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
    }

    // Cria usuários de teste com senhas criptografadas
    @PostConstruct
    public void criarUsuariosParaTeste() {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNome("Admin EuroInova");
            admin.setRa("00001");
            admin.setEmailCorporativo("admin@euroinova.com");
            admin.setDepartamento("Administração");
            admin.setSenha(passwordEncoder.encode("admin123")); // Criptografa a senha
            admin.setRole("ADMIN");
            usuarioRepository.save(admin);

            Usuario user = new Usuario();
            user.setNome("Ricardo Neto");
            user.setRa("99947");
            user.setEmailCorporativo("ricardo.neto@euroinova.com");
            user.setDepartamento("TI");
            user.setSenha(passwordEncoder.encode("12345")); // Criptografa a senha
            user.setRole("USER");
            usuarioRepository.save(user);
        }
    }

    @Data
    public static class LoginRequest {
        private String login;
        private String senha;
    }
}