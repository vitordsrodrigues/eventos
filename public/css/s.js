
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

        
        const participantesElement = document.getElementById(`participantesContagem_${eventId}`);
        const [_, max] = participantesElement.innerText.split('/');
        participantesElement.innerText = `${data.participantesAtuais}/${max}`;

        
        document.getElementById(`participarBtn_${eventId}`).style.display = 'none';
        document.getElementById(`cancelarBtn_${eventId}`).style.display = 'block';
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagemFlash('Vagas esgotadas.', 'danger');
    });
}

function cancelarParticipacao(eventId) {
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

        
        const participantesElement = document.getElementById(`participantesContagem_${eventId}`);
        const [_, max] = participantesElement.innerText.split('/');
        participantesElement.innerText = `${data.participantesAtuais}/${max}`;

        
        document.getElementById(`cancelarBtn_${eventId}`).style.display = 'none';
        document.getElementById(`participarBtn_${eventId}`).style.display = 'block';
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagemFlash('Erro ao cancelar a participação.', 'danger');
    });
}
