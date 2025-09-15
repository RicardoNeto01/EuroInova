document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica de Autenticação, Menu e Logoff (sem alterações) ---
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

    // --- Lógica da Página "Minhas Ideias" ---
    const ideaListContainer = document.querySelector('.idea-list-container');

    async function carregarMinhasIdeias() {
        try {
            const response = await fetch(`/api/ideias?usuarioId=${usuarioLogado.id}`);
            if (!response.ok) throw new Error('Falha ao carregar suas ideias');
            const ideias = await response.json();
            renderizarIdeias(ideias);
        } catch (error) {
            console.error('Erro:', error);
            ideaListContainer.innerHTML = '<p>Não foi possível carregar suas ideias.</p>';
        }
    }

    //
    // Renderiza as ideias com os botões de Ação
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
                    <h3 class="ideia-titulo">${ideia.titulo}</h3>
                    <p class="ideia-descricao">${ideia.descricao}</p>

                    <div class="post-actions">
                        <button class="btn-action btn-edit"><i class="fas fa-pencil-alt"></i> Editar</button>
                        <button class="btn-action btn-delete"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </article>
            `;
            ideaListContainer.insertAdjacentHTML('beforeend', postHTML);
        });
    }

    // --- LÓGICA DE CLIQUE ---
    ideaListContainer.addEventListener('click', async function(event) {
        const postArticle = event.target.closest('.idea-post');
        if (!postArticle) return;
        const ideaId = postArticle.dataset.id;

        // Ação de Deletar
        if (event.target.closest('.btn-delete')) {
            if (confirm('Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.')) {
                try {
                    const response = await fetch(`/api/ideias/${ideaId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Falha ao excluir a ideia.');
                    postArticle.remove();
                    alert('Ideia excluída com sucesso.');
                    // Recarrega os stats do dashboard, pois uma ideia foi removida
                } catch (error) {
                    alert(error.message);
                }
            }
        }

        // Ação de Editar (abre o modal)
        if (event.target.closest('.btn-edit')) {
            const titulo = postArticle.querySelector('.ideia-titulo').textContent;
            const descricao = postArticle.querySelector('.ideia-descricao').textContent;

            document.getElementById('edit-ideia-id').value = ideaId;
            document.getElementById('edit-ideia-titulo').value = titulo;
            document.getElementById('edit-ideia-descricao').value = descricao;

            document.getElementById('edit-ideia-modal').classList.remove('hidden');
        }
    });

    // --- LÓGICA DO MODAL DE EDIÇÃO ---
    const editModal = document.getElementById('edit-ideia-modal');
    const editForm = document.getElementById('edit-ideia-form');

    document.getElementById('fechar-edit-modal').addEventListener('click', () => editModal.classList.add('hidden'));

    editForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const id = document.getElementById('edit-ideia-id').value;
        const data = {
            titulo: document.getElementById('edit-ideia-titulo').value,
            descricao: document.getElementById('edit-ideia-descricao').value
        };

        try {
            const response = await fetch(`/api/ideias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Falha ao atualizar a ideia.');

            const ideiaAtualizada = await response.json();

            const postArticle = ideaListContainer.querySelector(`[data-id="${id}"]`);
            postArticle.querySelector('.ideia-titulo').textContent = ideiaAtualizada.titulo;
            postArticle.querySelector('.ideia-descricao').textContent = ideiaAtualizada.descricao;

            editModal.classList.add('hidden');
            alert('Ideia atualizada com sucesso!');
        } catch (error) {
            alert(error.message);
        }
    });

    carregarMinhasIdeias();
});