document.addEventListener('DOMContentLoaded', function() {
    // --- 1. LÓGICA DE AUTENTICAÇÃO, MENU E LOGOFF ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }

    // Como o cabeçalho é o mesmo, injetamos ele e sua lógica aqui
    const headerContainer = document.querySelector('.main-header');
    if (headerContainer) {
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

        // Ativa a lógica do menu e logoff no cabeçalho recém-criado
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
    }

    // --- 2. LÓGICA DA PÁGINA EXPLORAR COM FILTROS ---
    const ideaListContainer = document.querySelector('.idea-list-container');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const departmentFilterSelect = document.getElementById('filter-department');

    async function carregarTodasIdeias() {
        const activeSortButton = document.querySelector('.sort-btn.active');
        const ordenarPor = activeSortButton ? activeSortButton.dataset.sort : 'recentes';
        const departamento = departmentFilterSelect.value;
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

    // --- FUNÇÃO DE RENDERIZAÇÃO ATUALIZADA COM LÓGICA DE STATUS ---
    function renderizarIdeias(ideias) {
        ideaListContainer.innerHTML = '';
        if (ideias.length === 0) {
            ideaListContainer.innerHTML = '<p>Nenhuma ideia encontrada com os filtros selecionados.</p>';
            return;
        }
        ideias.forEach(ideia => {
            let statusClass = '';
            let statusHTML = '';

            // Lógica para definir a classe da borda e a "pílula" de status
            switch (ideia.status) {
                case 'Aprovada':
                    statusClass = 'approved';
                    statusHTML = `<span class="status-pill status-approved">Aprovada</span>`;
                    break;
                case 'Pendente':
                    statusClass = 'pending';
                    statusHTML = `<span class="status-pill status-pending">Pendente</span>`;
                    break;
                case 'Rejeitada':
                    statusClass = 'rejected';
                    statusHTML = `<span class="status-pill status-rejected">Rejeitada</span>`;
                    break;
            }

            const postHTML = `
                <article class="idea-post ${statusClass}" data-id="${ideia.id}">
                    <div class="post-header">
                        <span class="author">${ideia.autor}</span>
                        <span class="department">${ideia.departamento}</span>
                        ${statusHTML}
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
    departmentFilterSelect.addEventListener('change', carregarTodasIdeias);
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.sort-btn.active').classList.remove('active');
            button.classList.add('active');
            carregarTodasIdeias();
        });
    });

    // --- 4. CHAMADA INICIAL ---
    carregarTodasIdeias();
});