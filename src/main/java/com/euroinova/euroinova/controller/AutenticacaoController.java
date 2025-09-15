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
    private PasswordEncoder passwordEncoder;

    // --- NOVO ENDPOINT DE REGISTRO ---
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroDTO registroDTO) {
        // 1. Verifica se o usuário já existe usando o método do repositório
        if (usuarioRepository.existsByRaOrEmailCorporativo(registroDTO.getRa(), registroDTO.getEmailCorporativo())) {
            // Se existir, retorna um erro "Conflict"
            return ResponseEntity.status(HttpStatus.CONFLICT).body("RA ou E-mail já cadastrado.");
        }

        // 2. Cria uma nova instância de Usuário
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(registroDTO.getNome());
        novoUsuario.setRa(registroDTO.getRa());
        novoUsuario.setEmailCorporativo(registroDTO.getEmailCorporativo());

        // 3. CRIPTOGRAFA A SENHA ANTES DE SALVAR
        novoUsuario.setSenha(passwordEncoder.encode(registroDTO.getSenha()));

        // 4. Salva o novo usuário no banco de dados
        usuarioRepository.save(novoUsuario);

        // 5. Retorna uma resposta de sucesso "Created"
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");
    }

    // --- ENDPOINT DE LOGIN ATUALIZADO PARA USAR CRIPTOGRAFIA ---
    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailCorporativoOrRa(loginRequest.getLogin(), loginRequest.getLogin());

        // Ele compara a senha que o usuário digitou (em texto puro) com a senha
        // criptografada que está no banco de dados.
        if (usuarioOpt.isPresent() && passwordEncoder.matches(loginRequest.getSenha(), usuarioOpt.get().getSenha())) {
            // Se as senhas baterem, retorna o objeto do usuário
            return ResponseEntity.ok(usuarioOpt.get());
        }

        // Se não encontrar o usuário ou a senha estiver errada, retorna erro.
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
    }

    // DTO para o corpo da requisição de login
    @Data
    public static class LoginRequest {
        private String login;
        private String senha;
    }
}