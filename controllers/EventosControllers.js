const Evento = require('../models/Evento');
const User = require('../models/User');
const path = require('path')
const Participacao = require('../models/Participacao');
const {Op} = require('sequelize')
const Sugestao = require('../models/Sugestao');

module.exports = class EventosControllers {
    
    
    static async showEventos(req, res) {


        let search = ''

        if(req.query.search){
            search = req.query.search
        }
        try {
            const userId = req.session.userid;
            const eventosData = await Evento.findAll({
                where:{
                    title:{[Op.like]:`%${search}%`}
                }
            });
            let userName = null;
            let layout = 'main';

        
            if (userId) {
                const user = await User.findOne({ where: { id: userId } });
                userName = user ? user.name : null;
                layout = 'main-users';
            }

            let eventos;
            
            
            if (userId) {
                eventos = await Promise.all(eventosData.map(async (result) => {
                    const evento = result.dataValues;
                    const participacaoExistente = await Participacao.findOne({
                        where: { UserId: userId, EventoId: evento.id }
                    });
    
                    evento.isParticipating = !!participacaoExistente;
                    const data = new Date(evento.data);
                    const dataLimite = new Date(evento.datalimite);
                    evento.dataFormatada = data.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    evento.dataLimiteFormatada = dataLimite.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    return evento;
                }));
            } else {
                
                eventos = eventosData.map((result) => {
                    const evento = result.dataValues;
                    const data = new Date(evento.data);
                    evento.dataFormatada = data.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    evento.isParticipating = false;
                    return evento;
                });
            }
    
            const messages = req.flash();
            req.session.save(() => {
                res.render('eventos/home', { 
                    eventos, 
                    messages, 
                    userName,
                    layout,
                    search,
                    hasSearch: !!search,
                    user: req.session.user
                });
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Erro ao carregar eventos');
        }
    }
    

    static async dashboard(req, res) {
        try {
            const userId = req.session.userid;
            const user = await User.findOne({ where: { id: userId } });
            const userName = user ? user.name : null;

            // Buscar sugestões e converter para objetos planos
            const sugestoesRaw = await Sugestao.findAll({
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']]
            });

            // Converter para objetos planos
            const sugestoes = sugestoesRaw.map(sugestao => ({
                id: sugestao.id,
                nome: sugestao.nome,
                email: sugestao.email,
                assunto: sugestao.assunto,
                mensagem: sugestao.mensagem,
                status: sugestao.status,
                createdAt: sugestao.createdAt,
                User: sugestao.User ? {
                    name: sugestao.User.name
                } : null
            }));

            const messages = req.flash();
            req.session.save(() => {
                res.render('eventos/dashboard', { 
                    sugestoes,
                    messages,
                    userName,
                    layout: 'main-users'
                });
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Erro ao carregar o dashboard');
        }
    }

    static async createEvento(req, res) {
        const userId = req.session.userid;
        const user = await User.findOne({ where: { id: userId } });
        const userName = user ? user.name : null;

        res.render('eventos/create', {
            layout: 'main-users',
            userName
        });
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
            imagem: req.file ? req.file.filename : null,
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
    
            
            await Participacao.create({ 
                UserId: userId, 
                EventoId: id 
            });
            console.log('Participação criada para usuário:', userId, 'evento:', id); // Debug
    
            await Evento.update(
                { participantesAtuais: evento.participantesAtuais + 1 }, 
                { where: { id: id } }
            );
    
            res.status(200).json({
                message: 'Você se inscreveu com sucesso!',
                participantesAtuais: evento.participantesAtuais + 1
            });
        } catch (error) {
            console.error('Erro ao participar:', error);
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

    static async eventosParticipando(req, res) {
        try {
            const userId = req.session.userid;
            console.log('UserID:', userId); // Debug

           
            const participacoes = await Participacao.findAll({
                where: { UserId: userId },
                include: [{
                    model: Evento,
                    required: true
                }],
                raw: true,
                nest: true 
            });
            console.log('Participações encontradas:', participacoes); // Debug

           
            const eventos = participacoes.map(participacao => {
                const evento = participacao.Evento;
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                evento.isParticipating = true;
                return evento;
            });

            console.log('Eventos processados:', eventos); // Debug

           
            const user = await User.findOne({ 
                where: { id: userId },
                raw: true 
            });
            const userName = user ? user.name : null;

            res.render('eventos/eventos-participando', {
                eventos,
                userName,
                layout: 'main-users'
            });

        } catch (error) {
            console.log('Erro completo:', error);
            res.status(500).send('Erro ao carregar eventos participando');
        }
    }

    static async showProfile(req, res) {
        try {
            const userId = req.session.userid;
            
           
            const user = await User.findOne({ 
                where: { id: userId },
                attributes: ['id', 'name', 'email'] 
            });

            
            const participationCount = await Participacao.count({
                where: { UserId: userId }
            });

            const messages = req.flash();
            res.render('profile', {
                user,
                participationCount,
                messages,
                userName: user.name,
                layout: 'main-users'
            });

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            req.flash('message', 'Erro ao carregar perfil');
            res.redirect('/');
        }
    }

    
    static async meusEventos(req,res){
        
        try {
            const userId = req.session.userid;

            const participacoes = await Participacao.findAll({
                where: { UserId: userId },
                include: [{
                    model: Evento,
                    required: true
                }],
                raw: true,
                nest: true 
            });

           
            const eventos = participacoes.map(participacao => {
                const evento = participacao.Evento;
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                evento.isParticipating = true;
                return evento;
            });

            const user = await User.findOne({ 
                where: { id: userId },
                raw: true 
            });
            const userName = user ? user.name : null;

            res.render('eventos/meus-eventos', {
                eventos,
                userName,
                layout: 'main-users'
            });

        } catch (error) {
            console.log('Erro completo:', error);
            res.status(500).send('Erro ao carregar eventos participando');
        }
    }
    
    
    static async showSugestoes(req, res) {
        try {
            const userId = req.session.userid;
            const user = await User.findOne({ where: { id: userId } });
            const userName = user ? user.name : null;
            const userEmail = user ? user.email : null;

            res.render('eventos/sugestoes', {
                userName,
                userEmail,
                success: req.flash('success'),
                error: req.flash('error'),
                layout: 'main-users'
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar página de sugestões');
        }
    }

    static async enviarSugestao(req, res) {
        const { nome, email, assunto, mensagem } = req.body;
        const userId = req.session.userid;

        try {
            
            if (!nome || !email || !assunto || !mensagem) {
                req.flash('error', 'Por favor, preencha todos os campos');
                return res.redirect('/eventos/sugestoes');
            }

            await Sugestao.create({
                nome,
                email,
                assunto,
                mensagem,
                UserId: userId
            });

           
            req.flash('message', 'Sugestão enviada com sucesso!');
            req.session.save(() => {
                res.redirect('/');
            });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Erro ao enviar sugestão');
            res.redirect('/eventos/sugestoes');
        }
    }
    
    
    
    
    static async marcarSugestaoComoLida(req, res) {
        const { id } = req.params;
        
        try {
            const sugestao = await Sugestao.findByPk(id);
            if (!sugestao) {
                return res.status(404).json({ message: 'Sugestão não encontrada' });
            }

            await sugestao.update({ status: 'lida' });
            res.status(200).json({ message: 'Sugestão marcada como lida' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao marcar sugestão como lida' });
        }
    }

    static async excluirSugestao(req, res) {
        const { id } = req.params;
        
        try {
            const sugestao = await Sugestao.findByPk(id);
            if (!sugestao) {
                return res.status(404).json({ message: 'Sugestão não encontrada' });
            }

            await sugestao.destroy();
            res.status(200).json({ message: 'Sugestão excluída com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao excluir sugestão' });
        }
    }
}



