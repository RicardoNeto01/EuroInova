package com.euroinova.euroinova.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notificacoes")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId; // O ID do usuário que vai RECEBER a notificação

    @Column(nullable = false)
    private String mensagem;

    private boolean lida = false; // Começa como "não lida" por padrão

    private String link; // URL para onde o usuário será levado ao clicar

    private LocalDateTime dataCriacao = LocalDateTime.now();
}