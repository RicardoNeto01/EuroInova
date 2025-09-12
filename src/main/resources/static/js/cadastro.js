document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');

    registroForm.addEventListener('submit', async function(event) {
        // Impede o formulário de recarregar a página
        event.preventDefault();

        // Pega os valores de cada campo do formulário
        const nome = document.getElementById('nome').value;
        const ra = document.getElementById('ra').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        // 1. Validação no front-end: Verifica se as senhas coincidem
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem! Por favor, verifique.');
            return; // Para a execução se as senhas forem diferentes
        }

        // 2. Monta o objeto de dados para enviar à API
        const data = {
            nome: nome,
            ra: ra,
            emailCorporativo: email,
            senha: senha
        };

        try {
            // 3. Envia a requisição POST para o endpoint de registro
            const response = await fetch('/api/auth/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseBody = await response.text();

            if (response.status === 201) { // 201 Created = Sucesso
                alert(responseBody); // Mostra "Usuário registrado com sucesso!"
                window.location.href = '/login.html'; // Redireciona para a página de login
            } else {
                // Se der erro (ex: 409 Conflict), mostra a mensagem vinda do back-end
                alert('Erro no cadastro: ' + responseBody);
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            alert('Não foi possível conectar ao servidor. Tente novamente.');
        }
    });
});