document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        window.location.href = '/login.html';
        return;
    }

    if (usuarioLogado.role !== 'ADMIN') {
        alert('Acesso negado.');
        window.location.href = '/dashboard.html';
        return;
    }

    const headerContainer = document.querySelector('.main-header');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="header-column header-left">
                <div class="logo">EuroInova - ADMIN</div>
            </div>
            <div class="header-column header-center"></div>
            <div class="header-column header-right">
                <div class="user-profile">
                    <span id="nome-usuario">${usuarioLogado.nome}</span>
                    <i class="fas fa-user-circle"></i>
                </div>
                <a href="/logout" id="btn-logoff" class="btn-logoff"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
            </div>
        `;

    }
});