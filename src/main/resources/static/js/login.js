document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const loginInput = document.getElementById('login').value;
        const senhaInput = document.getElementById('senha').value;

        const data = {
            login: loginInput,
            senha: senhaInput
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const usuario = await response.json(); // Pega os dados do usuário

                // --- MUDANÇA CRÍTICA AQUI ---
                // Salva os dados do usuário no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

                // Redireciona para o dashboard
                window.location.href = '/dashboard.html';
            } else {
                alert('Credenciais inválidas. Verifique seu RA/email e senha.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});