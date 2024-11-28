module.exports = {
    eq: function(v1, v2) {
        return v1 === v2;
    },
    
    formatDate: function(date) {
        return date.toLocaleDateString('pt-BR');
    },
    
    isEventoAtivo: function(dataLimite) {
        return new Date(dataLimite) >= new Date();
    },

    temPermissaoBusca: function(user) {
        return true;
    },

    temPermissao: function(user, permissao) {
        if (!user) return false;
        
        switch(permissao) {
            case 'busca':
                return true;
            case 'admin':
                return user.role === 'admin';
            default:
                return false;
        }
    },

    isEventoEsgotado: function(evento) {
        return evento.participantesAtuais >= evento.participantes;
    }
}; 