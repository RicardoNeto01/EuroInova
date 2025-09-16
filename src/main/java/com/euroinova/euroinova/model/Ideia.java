package com.euroinova.euroinova.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ideias")
public class Ideia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;
    private String autor; // Nome do autor, para exibição
    private String departamento;
    private String status;
    private int votos;
    private int comentarios;

    // Guarda o ID do usuário que criou a ideia
    private Long usuarioId;
    @Transient // Esta anotação diz ao JPA para NÃO criar esta coluna no banco de dados
    private boolean votadoPeloUsuarioAtual;
}