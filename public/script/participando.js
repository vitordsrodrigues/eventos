function cancelarParticipacao(eventId) {
    const botaoCancelar = document.getElementById(`cancelarBtn_${eventId}`);
    const card = botaoCancelar.closest('.col-12.col-md-6.col-lg-4');
    
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
        card.style.transition = 'opacity 0.5s ease';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.remove();
            
            const eventosRestantes = document.querySelectorAll('.col-12.col-md-6.col-lg-4').length;
            if (eventosRestantes === 0) {
                const container = document.querySelector('.container');
                container.innerHTML = `
                    <div class="alert alert-info text-center">
                        <h4>Você ainda não está participando de nenhum evento</h4>
                        <p>Explore a <a href="/eventos">página de eventos</a> para encontrar eventos interessantes!</p>
                    </div>
                `;
            }
        }, 500);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
} 