document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DE AUTENTICAÇÃO E NOME DE USUÁRIO ---
    // (Reutilizamos a lógica do dashboard para proteger a página e mostrar o nome)
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;

    // --- LÓGICA DO MENU LATERAL (reutilizada) ---
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const sideNav = document.getElementById('side-nav');
    const overlay = document.getElementById('overlay');
    function abrirMenu() { sideNav.classList.add('show'); overlay.classList.add('show'); }
    function fecharMenu() { sideNav.classList.remove('show'); overlay.classList.remove('show'); }
    hamburgerBtn.addEventListener('click', abrirMenu);
    overlay.addEventListener('click', fecharMenu);

    // --- LÓGICA DO BOTÃO DE LOGOFF (reutilizada) ---
    const btnLogoff = document.getElementById('btn-logoff');
    btnLogoff.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('usuarioLogado');
        alert('Você saiu com sucesso!');
        window.location.href = '/login.html';
    });


    // --- FUNÇÃO PRINCIPAL PARA CARREGAR TODAS AS IDEIAS ---
    const ideaListContainer = document.querySelector('.idea-list-container');

    async function carregarTodasIdeias() {
        try {
            // Chama o novo endpoint /api/ideias/todas
            const response = await fetch('/api/ideias/todas');
            if (!response.ok) throw new Error('Falha ao carregar ideias');

            const ideias = await response.json();
            renderizarIdeias(ideias);
        } catch (error) {
            console.error('Erro:', error);
            ideaListContainer.innerHTML = '<p>Não foi possível carregar as ideias. Tente novamente mais tarde.</p>';
        }
    }

    // A função de renderizar é a mesma do dashboard
    function renderizarIdeias(ideias) {
        ideaListContainer.innerHTML = '';
        if (ideias.length === 0) {
            ideaListContainer.innerHTML = '<p>Nenhuma ideia foi enviada ainda.</p>';
            return;
        }
        ideias.forEach(ideia => {
            const postHTML = `
                <article class="idea-post ${ideia.status === 'Aprovada' ? 'approved' : ''}">
                    <div class="post-header">
                        <span class="author">${ideia.autor}</span>
                        <span class="department">${ideia.departamento}</span>
                        ${ideia.status === 'Aprovada' ? '<span class="status-approved">Aprovada</span>' : ''}
                    </div>
                    <h3>${ideia.titulo}</h3>
                    <p>${ideia.descricao}</p>
                    <div class="post-footer">
                        <span class="votes">${ideia.votos} <i class="fas fa-thumbs-up"></i></span>
                        <span class="comments">${ideia.comentarios} <i class="fas fa-comment"></i></span>
                    </div>
                </article>
            `;
            ideaListContainer.insertAdjacentHTML('beforeend', postHTML);
        });
    }

    // Inicia o carregamento das ideias
    carregarTodasIdeias();
});