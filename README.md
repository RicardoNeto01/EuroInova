# EuroInova 💡

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.X-green)

EuroInova é uma plataforma de inovação corporativa projetada para incentivar e gerenciar as ideias dos colaboradores de uma empresa, promovendo o engajamento e criando um fluxo de trabalho claro para a avaliação e desenvolvimento de novas propostas.

## 🚀 Funcionalidades Implementadas

O sistema é dividido em duas grandes áreas: a do Colaborador e a do Administrador.

### Funcionalidades do Colaborador
* **Autenticação Completa:** Sistema de login e cadastro de usuários, com fluxo de redirecionamento baseado no cargo.
* **Dashboard Personalizado:** Visualização de estatísticas pessoais (total de ideias, aprovadas, pendentes) e uma lista das suas ideias mais recentes.
* **Criação e Gestão de Ideias:**
    * Envio de novas ideias através de um formulário modal.
    * Página "Minhas Ideias" para visualizar, **editar** e **excluir** as próprias contribuições.
* **Interação e Descoberta:**
    * Página "Explorar" com um feed de todas as ideias da empresa.
    * **Filtros dinâmicos** por departamento e status (Pendente, Aprovada, Rejeitada).
    * **Ordenação** por "Mais Recentes" ou "Mais Votadas".
    * Sistema de **voto único** por usuário em cada ideia.
    * Página de **detalhes** para cada ideia, com uma seção de **comentários** funcional.

### Funcionalidades do Administrador
* **Acesso Restrito:** Uma página `/admin.html` acessível apenas para usuários com o cargo "ADMIN".
* **Dashboard de Métricas:**
    * Visualização de estatísticas globais, como o total de curtidas e comentários na plataforma.
    * Gráfico de pizza com a distribuição de ideias por status (Aprovada, Pendente, Rejeitada).
* **Gerenciamento Centralizado:**
    * Tabela com **todas as ideias** do sistema para fácil visualização e acesso.
    * Capacidade de **alterar o status** de qualquer ideia (Aprovada, Pendente, Rejeitada) em tempo real.
    * Funcionalidade para **excluir** ideias da plataforma (moderação).

## 🛠️ Tecnologias Utilizadas

* **Backend:** Java 17 com Spring Boot
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
* **Banco de Dados (Desenvolvimento):** H2 Database em memória
* **Banco de Dados (Planejado):** Oracle Database
* **Build & Gerenciamento:** Apache Maven
* **Biblioteca de Gráficos:** Chart.js

## 🏛️ Arquitetura

O projeto segue uma arquitetura planejada para ser baseada em microsserviços, separando as responsabilidades do back-end (APIs RESTful) e do front-end (interface do usuário).

## ⚙️ Como Executar o Projeto

### Pré-requisitos
* Java JDK 17 ou superior
* Apache Maven

### Passos
1.  Clone o repositório:
    ```bash
    git clone [https://github.com/RicardoNeto01/EuroInova.git](https://github.com/RicardoNeto01/EuroInova.git)
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd EuroInova
    ```
3.  Execute a aplicação usando o Maven Wrapper:
    * No Windows:
        ```bash
        mvnw.cmd spring-boot:run
        ```
    * No Mac/Linux:
        ```bash
        ./mvnw spring-boot:run
        ```
4.  A aplicação estará disponível em `http://localhost:8080`.

## 🔑 Credenciais de Teste

Usuários de teste são criados automaticamente ao iniciar a aplicação com o banco de dados vazio.

* **Administrador:**
    * **Usuário:** `admin@euroinova.com`
    * **Senha:** `admin123`
* **Usuário Comum:**
    * **Usuário:** `ricardo.neto@euroinova.com`
    * **Senha:** `12345`

## 👥 Autores

* **Ricardo Abrantes Lucas Neto** - RM: 99947
* **Felipe Coelho Assis dos Santos** - RM: 550984