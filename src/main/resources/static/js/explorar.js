document.addEventListener('DOMContentLoaded', function() {
    // --- 1. LÓGICA DE AUTENTICAÇÃO E NOME DE USUÁRIO ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;

    // --- 2. LÓGICA DO MENU LATERAL (SIDENAV) ---
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const sideNav = document.getElementById('side-nav');
    const overlay = document.getElementById('overlay');
    function abrirMenu() { sideNav.classList.add('show'); overlay.classList.add('show'); }
    function fecharMenu() { sideNav.classList.remove('show'); overlay.classList.remove('show'); }
    hamburgerBtn.addEventListener('click', abrirMenu);
    overlay.addEventListener('click', fecharMenu);

    // --- 3. LÓGICA DO BOTÃO DE LOGOFF ---
    const btnLogoff = document.getElementById('btn-logoff');
    btnLogoff.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('usuarioLogado');
        alert('Você saiu com sucesso!');
        window.location.href = '/login.html';
    });


    // --- 4. FUNÇÃO PRINCIPAL PARA CARREGAR TODAS AS IDEIAS ---
    const ideaListContainer = document.querySelector('.idea-list-container');

    async function carregarTodasIdeias() {
        try {
            // Envia o ID do usuário para o back-end saber o status de voto de cada ideia
            const response = await fetch(`/api/ideias/todas?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Falha ao carregar ideias');

            const ideias = await response.json();
            renderizarIdeias(ideias);
        } catch (error) {
            console.error('Erro:', error);
            ideaListContainer.innerHTML = '<p>Não foi possível carregar as ideias. Tente novamente mais tarde.</p>';
        }
    }

    // Função que "desenha" as ideias na tela
    function renderizarIdeias(ideias) {
        ideaListContainer.innerHTML = '';
        if (ideias.length === 0) {
            ideaListContainer.innerHTML = '<p>Nenhuma ideia foi enviada ainda na plataforma.</p>';
            return;
        }
        ideias.forEach(ideia => {
            const postHTML = `
                <article class="idea-post ${ideia.status === 'Aprovada' ? 'approved' : ''}" data-id="${ideia.id}">
                    <div class="post-header">
                        <span class="author">${ideia.autor}</span>
                        <span class="department">${ideia.departamento}</span>
                        ${ideia.status === 'Aprovada' ? '<span class="status-approved">Aprovada</span>' : ''}
                    </div>
                    <h3>${ideia.titulo}</h3>
                    <p>${ideia.descricao}</p>
                    <div class="post-footer">
                        <span class="votes btn-votar ${ideia.votadoPeloUsuarioAtual ? 'voted' : ''}">${ideia.votos} <i class="fas fa-thumbs-up"></i></span>
                        <span class="comments">${ideia.comentarios} <i class="fas fa-comment"></i></span>
                    </div>
                </article>
            `;
            ideaListContainer.insertAdjacentHTML('beforeend', postHTML);
        });
    }

    // --- 5. LÓGICA DE VOTAÇÃO ---
    ideaListContainer.addEventListener('click', async function(event) {
        const voteButton = event.target.closest('.btn-votar');
        if (voteButton) {
            const postArticle = voteButton.closest('.idea-post');
            const ideaId = postArticle.dataset.id;
            try {
                const response = await fetch(`/api/ideias/${ideaId}/votar?usuarioId=${usuarioLogado.id}`, {
                    method: 'POST'
                });

                if (!response.ok) throw new Error('Não foi possível registrar o voto.');

                const ideiaAtualizada = await response.json();

                // Atualiza o número de votos na tela em tempo real
                const votesSpan = postArticle.querySelector('.votes');
                votesSpan.innerHTML = `${ideiaAtualizada.votos} <i class="fas fa-thumbs-up"></i>`;

                // Alterna a classe '.voted' para a cor do ícone mudar
                voteButton.classList.toggle('voted');

            } catch (error) {
                console.error('Erro ao votar:', error);
                alert(error.message);
            }
        }
    });

    // --- 6. CHAMADA INICIAL ---
    carregarTodasIdeias();
});