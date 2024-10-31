const Evento = require('../models/Evento');
const User = require('../models/User');
const path = require('path')
const Participacao = require('../models/Participacao');

module.exports = class EventosControllers {
    
    
    static async showEventos(req, res) {
        try {
            const userId = req.session.userid;
            const eventosData = await Evento.findAll();
    
           
            const eventos = await Promise.all(eventosData.map(async (result) => {
                const evento = result.dataValues;
                const participacaoExistente = await Participacao.findOne({
                    where: { UserId: userId, EventoId: evento.id }
                });
    
                evento.isParticipating = !!participacaoExistente; // Define se o usuário está participando
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
                return evento;
            }));
    
            const messages = req.flash();
            req.session.save(() => {
                res.render('eventos/home', { eventos, messages });
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Erro ao carregar eventos');
        }
    }
    

    static async dashboard(req, res) {
        try {
            const eventosData = await Evento.findAll();
            const eventos = eventosData.map((result) => {
                const evento = result.dataValues;
                const data = new Date(evento.data);
                const dataLimite = new Date(evento.datalimite); // Adicionando dataLimite
                evento.dataFormatada = data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                evento.dataLimiteFormatada = dataLimite.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }); 
                return evento;
            });

            const messages = req.flash();
            req.session.save(() => {
                res.render('eventos/dashboard', { eventos, messages });
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Erro ao carregar o dashboard');
        }
    }

    static createEvento(req, res) {
        res.render('eventos/create');
    }

    static async createEventoSave (req, res) {
        const evento = {
            title: req.body.title,
            local: req.body.local,
            participantes: parseInt(req.body.participantes, 10),
            data: req.body.data,
            datalimite: req.body.datalimite, 
            palestrantes: req.body.palestrantes, 
            duracao: parseInt(req.body.duracao, 10),
            curso: req.body.curso,
            descricao: req.body.descricao,
            UserId: req.session.userid,
        };

        // Validações
        if (!evento.title || !evento.local || !evento.participantes || !evento.data || !evento.datalimite || !evento.duracao || !evento.curso) {
            req.flash('message', 'Por favor, preencha todos os campos obrigatórios.');
            return res.redirect('/eventos/create');
        }

        try {
            await Evento.create(evento);
            req.flash('message', 'Evento criado com sucesso');
            req.session.save(() => {
                res.redirect('/eventos/dashboard');
            });
        } catch (error) {
            console.log(error);
            req.flash('message', 'Erro ao criar evento: ' + error.message);
            res.redirect('/eventos/create');
        }
    }

    static async removeEvento (req, res) {
        const id = req.body.id;

        try {
            await Evento.destroy({ where: { id: id } });
            req.flash('message', 'Evento removido com sucesso');
            req.session.save(() => {
                res.redirect('/eventos/dashboard');
            });
        } catch (error) {
            console.log(error);
            req.flash('message', 'Erro ao remover evento');
            res.redirect('/eventos/dashboard');
        }
    }

    static async editEvento(req, res) {
        const id = req.params.id;
        console.log("ID recebido:", id);
    
        try {
            const evento = await Evento.findOne({ where: { id: id } });
            if (!evento) {
                console.log("Evento não encontrado");
                req.flash('message', 'Evento não encontrado ou você não tem permissão para editá-lo.');
                return res.redirect('/eventos/dashboard');
            }
    
            console.log("Evento encontrado:", evento);
            res.render('eventos/edit', { evento: evento.dataValues });
        } catch (error) {
            console.log("Erro ao carregar evento:", error);
            req.flash('message', 'Erro ao carregar evento: ' + error.message);
            res.redirect('/eventos/dashboard');
        }
    }
    
    static async editEventoSave(req, res) {
        const id = req.body.id;
    
        const eventoAtualizado = {
            title: req.body.title,
            local: req.body.local,
            participantes: parseInt(req.body.participantes, 10),
            data: req.body.data,
            datalimite: req.body.datalimite,
            palestrantes: req.body.palestrantes,
            duracao: parseInt(req.body.duracao, 10),
            curso: req.body.curso,
            descricao: req.body.descricao,
        };
    
        console.log('Dados recebidos:', eventoAtualizado);
    
        
        if (!eventoAtualizado.title || !eventoAtualizado.local || !eventoAtualizado.participantes || 
            !eventoAtualizado.data || !eventoAtualizado.datalimite || 
            !eventoAtualizado.duracao || !eventoAtualizado.curso) {
            req.flash('message', 'Por favor, preencha todos os campos obrigatórios.');
            return res.redirect(`/eventos/edit/${id}`);
        }
    
        try {
            const [updated] = await Evento.update(eventoAtualizado, { where: { id: id } });
            if (!updated) {
                req.flash('message', 'Evento não encontrado ou não foi atualizado.');
                return res.redirect(`/eventos/edit/${id}`);
            }
    
            req.flash('message', 'Evento atualizado com sucesso.');
            req.session.save(() => {
                res.redirect('/eventos/dashboard');
            });
        } catch (error) {
            console.log(error);
            req.flash('message', 'Erro ao atualizar evento: ' + error.message);
            res.redirect(`/eventos/edit/${id}`);
        }
    }
    
  

    static async participarEvento(req, res) {
        const { id } = req.body; 
        const userId = req.session.userid;  
    
        try {
            const evento = await Evento.findOne({ where: { id: id } });
    
            if (!evento) {
                return res.status(404).json({ message: 'Evento não encontrado.' });
            }
    
           
            if (evento.participantesAtuais >= evento.participantes) {
                return res.status(400).json({ message: 'O evento já atingiu o número máximo de participantes.' });
            }
    
            
            const participacaoExistente = await Participacao.findOne({
                where: {
                    UserId: userId,
                    EventoId: id
                }
            });
    
            if (participacaoExistente) {
                return res.status(400).json({ message: 'Você já está inscrito neste evento.' });
            }
    
            
            await Evento.update({ participantesAtuais: evento.participantesAtuais + 1 }, { where: { id: id } });
            await Participacao.create({ UserId: userId, EventoId: id });
    
            res.status(200).json({
                message: 'Você se inscreveu com sucesso (atualize a página para cancelar a inscricão)!',
                participantesAtuais: evento.participantesAtuais + 1
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao participar do evento.' });
        }
    }
    


static async cancelarParticipacao(req, res) {
    const { id } = req.body;
    const userId = req.session.userid;

    try {
       
        const participacao = await Participacao.findOne({
            where: {
                UserId: userId,
                EventoId: id
            }
        });

        if (!participacao) {
            return res.status(404).json({ message: 'Participação não encontrada.' });
        }

       
        const evento = await Evento.findOne({ where: { id: id } });
        await Evento.update({ participantesAtuais: evento.participantesAtuais - 1 }, { where: { id: id } });

        
        await participacao.destroy();

        res.status(200).json({
            message: 'Participação cancelada com sucesso!',
            participantesAtuais: evento.participantesAtuais - 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cancelar a participação.' });
    }
}

    
    
    
    
    
    
}
