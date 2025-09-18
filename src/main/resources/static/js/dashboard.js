document.addEventListener('DOMContentLoaded', function() {
    // --- 1. LÓGICA DE AUTENTICAÇÃO E REDIRECIONAMENTO POR CARGO ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }

    // LÓGICA DE REDIRECIONAMENTO: Se o usuário for ADMIN, envia para a página de admin
    if (usuarioLogado.role === 'ADMIN') {
        window.location.href = '/admin.html';
        return; // Para a execução do script para não carregar o dashboard para o admin
    }


    // --- O CÓDIGO ABAIXO SÓ EXECUTA PARA USUÁRIOS NORMAIS ---

    // --- 2. MONTAGEM DA PÁGINA PARA O USUÁRIO ---
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;
    document.getElementById('mensagem-boas-vindas').textContent = `Bem-vindo(a) de volta, ${usuarioLogado.nome}!`;

    const mainColumn = document.querySelector('.main-column');
    const ideaListContainer = document.querySelector('.idea-list');

    // --- 3. FUNÇÕES PARA CARREGAR DADOS DINÂMICOS DA API ---

    async function carregarStats() {
        try {
            const response = await fetch(`/api/dashboard/stats?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Falha ao carregar estatísticas');

            const stats = await response.json();
            document.getElementById('stats-minhas-ideias').textContent = stats.minhasIdeias;
            document.getElementById('stats-aprovadas').textContent = stats.ideiasAprovadas;
            document.getElementById('stats-pendentes').textContent = stats.ideiasPendentes;
            document.getElementById('stats-contribuicoes').textContent = stats.contribuicoes;
        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    }

    async function carregarIdeias() {
        try {
            const response = await fetch(`/api/ideias?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Falha ao carregar as ideias da API');

            const ideias = await response.json();
            renderizarIdeias(ideias);
        } catch (error) {
            console.error('Erro:', error);
            ideaListContainer.innerHTML = '<p>Não foi possível carregar as ideias.</p>';
        }
    }

    function renderizarIdeias(ideias) {
        ideaListContainer.innerHTML = '';
        if (ideias.length === 0) {
            ideaListContainer.innerHTML = '<p>Você ainda não enviou nenhuma ideia.</p>';
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
                    <h3><a href="/ideia.html?id=${ideia.id}" class="ideia-titulo-link">${ideia.titulo}</a></h3>
                    <p class="ideia-descricao">${ideia.descricao}</p>
                    <div class="post-footer">
                        <span class="votes btn-votar ${ideia.votadoPeloUsuarioAtual ? 'voted' : ''}">${ideia.votos} <i class="fas fa-thumbs-up"></i></span>
                        <span class="comments">${ideia.comentarios} <i class="fas fa-comment"></i></span>
                    </div>
                </article>
            `;
            ideaListContainer.insertAdjacentHTML('beforeend', postHTML);
        });
    }

    async function carregarTopIdeias() {
        const topIdeiasList = document.getElementById('top-ideas-list');
        const MAX_TITLE_LENGTH = 30;
        try {
            const response = await fetch(`/api/dashboard/top-ideias?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Falha ao carregar top ideias');

            const topIdeias = await response.json();
            topIdeiasList.innerHTML = '';
            if (topIdeias.length === 0) {
                topIdeiasList.innerHTML = '<li>Nenhuma ideia votada ainda.</li>';
                return;
            }
            topIdeias.forEach((ideia, index) => {
                let tituloExibicao = ideia.titulo;
                if (tituloExibicao.length > MAX_TITLE_LENGTH) {
                    tituloExibicao = tituloExibicao.substring(0, MAX_TITLE_LENGTH) + '...';
                }
                const itemHTML = `
                    <li>
                        <span class="rank">#${index + 1}</span>
                        <span class="title-truncated">${tituloExibicao}</span>
                        <span class="votes">${ideia.votos}</span>
                    </li>
                `;
                topIdeiasList.insertAdjacentHTML('beforeend', itemHTML);
            });
        } catch (error) {
            console.error('Erro ao carregar top ideias:', error);
            topIdeiasList.innerHTML = '<li>Não foi possível carregar.</li>';
        }
    }

    // --- 4. LÓGICAS DE INTERAÇÃO (VOTO, MODAL, MENU, LOGOFF) ---
    mainColumn.addEventListener('click', async function(event) {
        const voteButton = event.target.closest('.btn-votar');
        if (voteButton) {
            const postArticle = voteButton.closest('.idea-post');
            const ideaId = postArticle.dataset.id;
            try {
                const response = await fetch(`/api/ideias/${ideaId}/votar?usuarioId=${usuarioLogado.id}`, { method: 'POST' });
                if (!response.ok) throw new Error('Não foi possível registrar o voto.');

                const ideiaAtualizada = await response.json();

                const votesSpan = postArticle.querySelector('.votes');
                votesSpan.innerHTML = `${ideiaAtualizada.votos} <i class="fas fa-thumbs-up"></i>`;

                voteButton.classList.toggle('voted');

                carregarTopIdeias();
                carregarStats();
            } catch (error) {
                console.error('Erro ao votar:', error);
                alert(error.message);
            }
        }
    });

    const modal = document.getElementById('modal-nova-ideia');
    const btnAbrirModal = document.querySelector('.btn-new-idea');
    const btnFecharModal = document.getElementById('fechar-modal');
    const formNovaIdeia = document.getElementById('nova-ideia-form');
    btnAbrirModal.addEventListener('click', () => { modal.classList.remove('hidden'); });
    function fecharModal() { modal.classList.add('hidden'); }
    btnFecharModal.addEventListener('click', fecharModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) { fecharModal(); } });
    formNovaIdeia.addEventListener('submit', async function(event) {
        event.preventDefault();
        const titulo = document.getElementById('ideia-titulo').value;
        const descricao = document.getElementById('ideia-descricao').value;
        const novaIdeia = { titulo, descricao };
        try {
            const response = await fetch(`/api/ideias?usuarioId=${usuarioLogado.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaIdeia)
            });
            if (!response.ok) throw new Error('Falha ao enviar a ideia.');
            alert('Ideia enviada com sucesso!');
            formNovaIdeia.reset();
            fecharModal();
            carregarIdeias();
            carregarStats();
            carregarTopIdeias();
        } catch (error) {
            console.error('Erro ao enviar ideia:', error);
            alert('Ocorreu um erro ao enviar sua ideia. Tente novamente.');
        }
    });

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
        window.location.href = '/login.html';
    });


    // --- 5. CHAMADAS INICIAIS ---
    carregarStats();
    carregarIdeias();
    carregarTopIdeias();
});

// Inicia todo o processo
document.addEventListener('DOMContentLoaded', initDashboard);