document.addEventListener('DOMContentLoaded', async function() {
    // --- LÓGICA DE AUTENTICAÇÃO, CABEÇALHO E MENU ---
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || usuarioLogado.role !== 'ADMIN') {
        alert('Acesso negado. Esta área é restrita para administradores.');
        window.location.href = '/dashboard.html';
        return;
    }
    const headerContainer = document.querySelector('.main-header');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="header-column header-left">
                <button id="hamburger-menu" class="hamburger-menu"><i class="fas fa-bars"></i></button>
                <div class="logo">EuroInova - ADMIN</div>
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
        const btnLogoff = document.getElementById('btn-logoff');

        if(hamburgerBtn && sideNav && overlay) {
            function abrirMenu() { sideNav.classList.add('show'); overlay.classList.add('show'); }
            function fecharMenu() { sideNav.classList.remove('show'); overlay.classList.remove('show'); }

            hamburgerBtn.addEventListener('click', abrirMenu);
            overlay.addEventListener('click', fecharMenu);
        }

        btnLogoff.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('usuarioLogado');
            alert('Você saiu com sucesso!');
            window.location.href = '/login.html';
        });
    }

    // --- LÓGICA DA PÁGINA DE ADMIN ---
    let ideaIdToDelete = null; // Variável global para guardar o ID da ideia a ser excluída

    async function renderStatusChart() {
        try {
            const response = await fetch('/api/admin/stats/status-distribution');
            const data = await response.json();
            const ctx = document.getElementById('statusPieChart').getContext('2d');

            if (window.myStatusChart instanceof Chart) {
                window.myStatusChart.destroy();
            }

            window.myStatusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Aprovadas', 'Pendentes', 'Rejeitadas'],
                    datasets: [{
                        label: 'Status das Ideias',
                        data: [data.aprovadas, data.pendentes, data.rejeitadas],
                        backgroundColor: [ 'rgba(40, 167, 69, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(220, 53, 69, 0.7)' ],
                        borderColor: [ 'rgba(40, 167, 69, 1)', 'rgba(255, 193, 7, 1)', 'rgba(220, 53, 69, 1)' ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' }, title: { display: false } }
                }
            });
        } catch (error) {
            console.error("Erro ao renderizar o gráfico:", error);
        }
    }

    async function renderGlobalStats() {
        try {
            const response = await fetch('/api/admin/stats/global');
            const data = await response.json();
            document.getElementById('total-curtidas').textContent = data.totalCurtidas;
            document.getElementById('total-comentarios').textContent = data.totalComentarios;
        } catch (error) {
            console.error("Erro ao renderizar as estatísticas globais:", error);
        }
    }

    async function carregarTabelaDeIdeias() {
        const tableBody = document.getElementById('ideias-table-body');
        if (!tableBody) return;

        try {
            const response = await fetch('/api/admin/ideias');
            const ideias = await response.json();

            tableBody.innerHTML = '';
            if (ideias.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">Nenhuma ideia encontrada.</td></tr>';
                return;
            }

            ideias.forEach(ideia => {
                const rowHTML = `
                    <tr data-id="${ideia.id}">
                        <td><a href="/ideia.html?id=${ideia.id}" class="ideia-titulo-link">${ideia.titulo}</a></td>
                        <td>${ideia.autor}</td>
                        <td>${ideia.departamento}</td>
                        <td>${ideia.votos}</td>
                        <td class="status-cell">${ideia.status}</td>
                        <td class="actions-cell">
                            <select class="status-select">
                                <option value="Pendente" ${ideia.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="Aprovada" ${ideia.status === 'Aprovada' ? 'selected' : ''}>Aprovada</option>
                                <option value="Rejeitada" ${ideia.status === 'Rejeitada' ? 'selected' : ''}>Rejeitada</option>
                            </select>
                            <button class="btn-delete-admin" title="Excluir Ideia">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', rowHTML);
            });
        } catch (error) {
            console.error("Erro ao carregar a tabela de ideias:", error);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar as ideias.</td></tr>';
            }
        }
    }

    // --- LÓGICA PARA MUDANÇA DE STATUS E EXCLUSÃO ---
    const tableContainer = document.querySelector('.management-table-container');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');

    // Evento para cliques (para abrir o modal de exclusão)
    tableContainer.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-delete-admin');
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            ideaIdToDelete = row.dataset.id; // Guarda o ID da ideia a ser excluída
            confirmDeleteModal.classList.remove('hidden'); // Abre o modal
        }
    });

    // Evento para fechar o modal
    btnCancelDelete.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        ideaIdToDelete = null; // Limpa o ID guardado
    });

    // Evento para confirmar a exclusão
    btnConfirmDelete.addEventListener('click', async () => {
        if (!ideaIdToDelete) return;

        try {
            const response = await fetch(`/api/admin/ideias/${ideaIdToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir a ideia.');

            const row = tableContainer.querySelector(`tr[data-id="${ideaIdToDelete}"]`);
            if (row) row.remove();

            alert('Ideia excluída com sucesso.');

            renderStatusChart();
            renderGlobalStats();
        } catch (error) {
            alert(error.message);
        } finally {
            confirmDeleteModal.classList.add('hidden');
            ideaIdToDelete = null;
        }
    });

    // Evento para mudanças no select de status
    tableContainer.addEventListener('change', async function(event) {
        if (event.target.classList.contains('status-select')) {
            const selectElement = event.target;
            const novoStatus = selectElement.value;
            const row = selectElement.closest('tr');
            const ideiaId = row.dataset.id;

            try {
                const response = await fetch(`/api/admin/ideias/${ideiaId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: novoStatus })
                });

                if (!response.ok) throw new Error('Falha ao atualizar o status.');

                row.querySelector('.status-cell').textContent = novoStatus;

                renderStatusChart();

                alert('Status da ideia atualizado com sucesso!');
            } catch (error) {
                console.error("Erro ao atualizar status:", error);
                alert(error.message);
                selectElement.value = row.querySelector('.status-cell').textContent;
            }
        }
    });

    // --- CHAMADAS INICIAIS ---
    renderStatusChart();
    renderGlobalStats();
    carregarTabelaDeIdeias();
});