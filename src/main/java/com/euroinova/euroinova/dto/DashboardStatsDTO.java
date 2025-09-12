package com.euroinova.euroinova.dto;

import lombok.Data;

@Data
public class DashboardStatsDTO {
    private long minhasIdeias;
    private long ideiasAprovadas;
    private long ideiasPendentes;
    private long contribuicoes;
}