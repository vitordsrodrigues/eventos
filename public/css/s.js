setTimeout(function() {
    const flashMessage = document.getElementById('flash-message');
    if (flashMessage) {
        flashMessage.style.transition = 'opacity 0.5s ease-out';
        flashMessage.style.opacity = '0';
        setTimeout(() => {
            flashMessage.remove();
        }, 500);
    }
}, 2500);

const estiloFlashMessage = document.createElement('style');
estiloFlashMessage.textContent = `
    .flash-message {
        position: fixed;
        bottom: 20px; 
        right: 20px;  
        z-index: 1000; 
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    }

    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }

    .shake-animation {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(estiloFlashMessage);


function mostrarMensagemFlash(mensagem, tipo = 'success') {
    const flashMessage = document.createElement('div');
    flashMessage.id = 'flash-message';
    flashMessage.className = `alert alert-${tipo} flash-message`;
    flashMessage.innerText = mensagem;
    document.body.prepend(flashMessage);

    
    setTimeout(() => {
        flashMessage.style.transition = 'opacity 0.5s ease-out';
        flashMessage.style.opacity = '0';
        setTimeout(() => flashMessage.remove(), 500);
    }, 2500);
}


function participarEvento(eventId) {
    const botao = document.getElementById(`participarBtn_${eventId}`);
    const cancelarBotao = document.getElementById(`cancelarBtn_${eventId}`);
    
    botao.classList.add('shake-animation');
    
    setTimeout(() => {
        botao.classList.remove('shake-animation');
    }, 500);

    fetch(`/eventos/participar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Erro ao participar do evento.');
    })
    .then(data => {
        mostrarMensagemFlash(data.message);

        // Atualiza o contador de participantes
        const participantesElement = document.getElementById(`participantesContagem_${eventId}`);
        const [_, max] = participantesElement.innerText.split('/');
        participantesElement.innerText = `${data.participantesAtuais}/${max}`;

        // Troca os botões
        botao.style.display = 'none';
        
        // Cria o botão de cancelar se não existir
        if (!cancelarBotao) {
            const novoBotaoCancelar = document.createElement('button');
            novoBotaoCancelar.id = `cancelarBtn_${eventId}`;
            novoBotaoCancelar.className = 'btn btn-danger w-100';
            novoBotaoCancelar.onclick = () => cancelarParticipacao(eventId);
            novoBotaoCancelar.textContent = 'Cancelar Participação';
            botao.parentNode.appendChild(novoBotaoCancelar);
        } else {
            cancelarBotao.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagemFlash('Vagas esgotadas.', 'danger');
    });
}

function cancelarParticipacao(eventId) {
    const botaoParticipar = document.getElementById(`participarBtn_${eventId}`);
    const botaoCancelar = document.getElementById(`cancelarBtn_${eventId}`);
    
    // Adiciona animação de shake ao botão de cancelar
    botaoCancelar.classList.add('shake-animation');
    
    setTimeout(() => {
        botaoCancelar.classList.remove('shake-animation');
    }, 500);

    fetch(`/eventos/cancelar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Erro ao cancelar a participação.');
    })
    .then(data => {
        mostrarMensagemFlash(data.message);

        // Atualiza o contador de participantes
        const participantesElement = document.getElementById(`participantesContagem_${eventId}`);
        const [_, max] = participantesElement.innerText.split('/');
        participantesElement.innerText = `${data.participantesAtuais}/${max}`;

        // Troca os botões
        botaoCancelar.style.display = 'none';
        
        // Configura o botão de participar
        if (!botaoParticipar) {
            const novoBotaoParticipar = document.createElement('button');
            novoBotaoParticipar.id = `participarBtn_${eventId}`;
            novoBotaoParticipar.className = 'btn btn-primary w-100';
            novoBotaoParticipar.onclick = () => participarEvento(eventId);
            novoBotaoParticipar.textContent = 'Participar';
            botaoCancelar.parentNode.appendChild(novoBotaoParticipar);
        } else {
            botaoParticipar.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagemFlash('Erro ao cancelar a participação.', 'danger');
    });
}




function filtrarEventos(curso) {
    const cards = document.querySelectorAll('.evento-card');
    const semEventos = document.getElementById('sem-eventos');
    let eventosVisiveis = 0;
    document.getElementById('cursoNome').textContent = curso.charAt(0).toUpperCase() + curso.slice(1);

    cards.forEach(card => {
        const cursoCarta = card.getAttribute('data-curso').toLowerCase();
        if (curso === 'todos' || cursoCarta === curso) {
            card.style.display = 'block';
            eventosVisiveis++;
        } else {
            card.style.display = 'none';
        }
    });

    if (eventosVisiveis === 0) {
        semEventos.classList.remove('d-none');
    } else {
        semEventos.classList.add('d-none');
    }
}