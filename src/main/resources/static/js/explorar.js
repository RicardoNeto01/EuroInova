document.addEventListener('DOMContentLoaded', function() {
    // --- 1. LÓGICA DE AUTENTICAÇÃO, MENU E LOGOFF ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;

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


    // --- 2. LÓGICA DA PÁGINA EXPLORAR COM FILTROS ---
    const ideaListContainer = document.querySelector('.idea-list-container');
    const departmentFilterSelect = document.getElementById('filter-department');
    const sortOptionsContainer = document.querySelector('.sort-options');
    const sortButtons = document.querySelectorAll('.sort-btn');

    // Função principal que busca os dados da API com base nos filtros selecionados
    async function carregarIdeias() {
        // Encontra o botão de ordenação que está ativo para saber o valor
        const activeSortButton = document.querySelector('.sort-btn.active');
        const ordenarPor = activeSortButton.dataset.sort;
        const departamento = departmentFilterSelect.value;

        // Monta a URL da API dinamicamente com os parâmetros
        const url = new URL('/api/ideias/todas', window.location.origin);
        url.searchParams.append('usuarioId', usuarioLogado.id);
        url.searchParams.append('ordenarPor', ordenarPor);
        if (departamento && departamento !== 'Todos') {
            url.searchParams.append('departamento', departamento);
        }

        try {
            const response = await fetch(url);
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
            ideaListContainer.innerHTML = '<p>Nenhuma ideia encontrada com os filtros selecionados.</p>';
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

    // Lógica de Votação
    ideaListContainer.addEventListener('click', async function(event) {
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
            } catch (error) {
                console.error('Erro ao votar:', error);
                alert(error.message);
            }
        }
    });

    // --- 3. EVENT LISTENERS PARA OS FILTROS ---
    // Recarrega as ideias quando o filtro de departamento for alterado
    departmentFilterSelect.addEventListener('change', carregarIdeias);

    // Adiciona a lógica de clique para os botões de ordenação
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' do botão que estava ativo
            sortOptionsContainer.querySelector('.active').classList.remove('active');
            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');
            // Recarrega as ideias com a nova ordenação
            carregarIdeias();
        });
    });

    // --- 4. CHAMADA INICIAL ---
    // Carrega as ideias com os filtros padrão assim que a página é aberta
    carregarIdeias();
});