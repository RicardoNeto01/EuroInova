package com.euroinova.euroinova.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "votos")
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;
    private Long ideiaId;

    public Voto() {}

    public Voto(Long usuarioId, Long ideiaId) {
        this.usuarioId = usuarioId;
        this.ideiaId = ideiaId;
    }
}