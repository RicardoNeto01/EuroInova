package com.euroinova.euroinova.controller;

import com.euroinova.euroinova.model.Notificacao;
import com.euroinova.euroinova.repository.NotificacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @GetMapping
    public List<Notificacao> buscarNotificacoesPorUsuario(@RequestParam Long usuarioId) {

        return notificacaoRepository.findByUsuarioIdOrderByIdDesc(usuarioId);
    }
}