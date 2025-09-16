document.addEventListener('DOMContentLoaded', function() {
    // --- 1. LÓGICA DE AUTENTICAÇÃO E CABEÇALHO ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }

    const headerContainer = document.querySelector('.main-header');
    headerContainer.innerHTML = `
        <div class="header-column header-left">
            <button id="hamburger-menu" class="hamburger-menu"><i class="fas fa-bars"></i></button>
            <div class="logo">Eurolnova</div>
        </div>
        <div class="header-column header-center"></div>
        <div class="header-column header-right">
            <div class="user-profile">
                <span id="nome-usuario">${usuarioLogado.nome}</span>
                <i class="fas fa-user-circle"></i>
            </div>
            <a href="#" id="btn-logoff" class="btn-logoff"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
        </div>
    `;
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const sideNav = document.getElementById('side-nav');
    const overlay = document.getElementById('overlay');
    function abrirMenu() { sideNav.classList.add('show'); overlay.classList.add('show'); }
    function fecharMenu() { sideNav.classList.remove('show'); overlay.classList.remove('show'); }
    hamburgerBtn.addEventListener('click', abrirMenu);
    overlay.addEventListener('click', fecharMenu);

    const btnLogoff = document.getElementById('btn-logoff');
    btnLogoff.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('usuarioLogado');
        alert('Você saiu com sucesso!');
        window.location.href = '/login.html';
    });

    // --- 2. LÓGICA DA PÁGINA DE DETALHES ---
    const ideiaDetalheContainer = document.getElementById('ideia-detalhe-container');
    const urlParams = new URLSearchParams(window.location.search);
    const ideiaId = urlParams.get('id');

    async function carregarDetalhesDaIdeia() {
        if (!ideiaId) {
            ideiaDetalheContainer.innerHTML = "<p>Erro: ID da ideia não fornecido na URL.</p>";
            return;
        }
        try {
            const response = await fetch(`/api/ideias/${ideiaId}?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Ideia não encontrada ou erro no servidor.');

            const ideia = await response.json();

            ideiaDetalheContainer.innerHTML = `
                <h1 class="ideia-detalhe-titulo">${ideia.titulo}</h1>
                <div class="ideia-detalhe-meta">
                    <span><i class="fas fa-user"></i><strong>Autor:</strong> ${ideia.autor}</span>
                    <span><i class="fas fa-building"></i><strong>Departamento:</strong> ${ideia.departamento}</span>
                    <span><i class="fas fa-info-circle"></i><strong>Status:</strong> ${ideia.status}</span>
                </div>
                <div class="post-footer" style="margin-bottom: 25px; font-size: 16px;">
                    <span class="votes btn-votar ${ideia.votadoPeloUsuarioAtual ? 'voted' : ''}" data-id="${ideia.id}">${ideia.votos} <i class="fas fa-thumbs-up"></i></span>
                    <span class="comments">${ideia.comentarios} <i class="fas fa-comment"></i></span>
                </div>
                <p class="ideia-detalhe-descricao">${ideia.descricao.replace(/\n/g, '<br>')}</p>
            `;
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            ideiaDetalheContainer.innerHTML = `<p>Erro ao carregar a ideia. ${error.message}</p>`;
        }
    }

    // --- 3. LÓGICA DOS COMENTÁRIOS ---
    const listaComentarios = document.getElementById('lista-comentarios');
    const novoComentarioForm = document.getElementById('novo-comentario-form');

    async function carregarComentarios() {
        if (!ideiaId) return;
        try {
            const response = await fetch(`/api/ideias/${ideiaId}/comentarios`);
            const comentarios = await response.json();

            listaComentarios.innerHTML = '';
            if (comentarios.length === 0) {
                listaComentarios.innerHTML = '<p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
                return;
            }
            comentarios.forEach(comentario => {
                const comentarioHTML = `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${comentario.autorNome}</span>
                            <span class="comment-date">${new Date(comentario.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p class="comment-body">${comentario.texto}</p>
                    </div>
                `;
                listaComentarios.insertAdjacentHTML('beforeend', comentarioHTML);
            });
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            listaComentarios.innerHTML = '<p>Não foi possível carregar os comentários.</p>';
        }
    }

    novoComentarioForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const textoComentario = document.getElementById('comentario-texto').value;
        if (!textoComentario.trim()) return;

        try {
            const response = await fetch(`/api/ideias/${ideiaId}/comentarios?usuarioId=${usuarioLogado.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: textoComentario })
            });
            if (!response.ok) throw new Error('Falha ao enviar comentário.');

            document.getElementById('comentario-texto').value = ''; // Limpa o campo
            carregarComentarios(); // Recarrega a lista de comentários
            carregarDetalhesDaIdeia(); // Recarrega os detalhes para atualizar o contador
        } catch(error) {
            alert(error.message);
        }
    });

    // Lógica de votação (escutando no container de detalhes)
    ideiaDetalheContainer.addEventListener('click', async function(event) {
        const voteButton = event.target.closest('.btn-votar');
        if (voteButton) {
            try {
                const response = await fetch(`/api/ideias/${ideiaId}/votar?usuarioId=${usuarioLogado.id}`, { method: 'POST' });
                if (!response.ok) throw new Error('Não foi possível registrar o voto.');

                const ideiaAtualizada = await response.json();

                voteButton.innerHTML = `${ideiaAtualizada.votos} <i class="fas fa-thumbs-up"></i>`;
                voteButton.classList.toggle('voted');
            } catch (error) {
                alert(error.message);
            }
        }
    });

    // --- 4. CHAMADAS INICIAIS ---
    carregarDetalhesDaIdeia();
    carregarComentarios();
});