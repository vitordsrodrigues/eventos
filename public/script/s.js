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
document.querySelector('.curso-texto').textContent = nomeDoCurso;
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
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/eventos/participar';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'id';
    input.value = eventId;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function cancelarParticipacao(eventId) {
    const botaoParticipar = document.getElementById(`participarBtn_${eventId}`);
    const botaoCancelar = document.getElementById(`cancelarBtn_${eventId}`);
    
    
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
        const participantesElement = document.getElementById(`participantesContagem_${eventId}`);
        const [_, max] = participantesElement.innerText.split('/');
        participantesElement.innerText = `${data.participantesAtuais}/${max}`;

        
        botaoCancelar.style.display = 'none';
        
        
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
    
  
    const nomeCursos = {
        'todos': 'Todos os Cursos',
        'nenhum': 'Nenhum Curso Relacionado',
        'eletronica': 'Eletrônica',
        'eletrotecnica': 'Eletrotécnica',
        'moveis': 'Móveis',
        'mecanica': 'Mecânica',
        'quimica': 'Química',
        'informatica': 'Informática',
        'meio ambiente': 'Meio Ambiente'
    };
    
   
    const cursoFormatado = nomeCursos[curso.toLowerCase()] || curso;
    
  
    document.getElementById('cursoNome').innerHTML = `
        <span class="curso-badge bg-primary text-white px-4 py-2 rounded-pill shadow-sm">
            <i class="bi bi-mortarboard-fill me-2"></i>
            <span class="curso-texto">${cursoFormatado}</span>
        </span>
    `;

    
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