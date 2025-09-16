package com.euroinova.euroinova.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "comentarios")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(nullable = false)
    private String autorNome;

    @Column(nullable = false)
    private Long ideiaId;

    @Column(nullable = false)
    private Long usuarioId;

    private LocalDateTime dataCriacao = LocalDateTime.now();
}