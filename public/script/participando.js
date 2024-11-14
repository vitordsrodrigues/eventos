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
                    <div class="empty-state text-center py-5">
            <h3 class="text-primary mb-3">Nenhum evento encontrado</h3>
            <p class="text-muted mb-4">Você ainda não está participando de nenhum evento. Que tal começar agora?</p>
            <a href="/eventos" class="btn btn-primary btn-lg">
                <i class="bi bi-calendar-plus me-2"></i>
                Explorar Eventos
            </a>
        </div>
                `;
            }
        }, 500);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
} 