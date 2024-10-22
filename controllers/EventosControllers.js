const Evento = require('../models/Evento');
const User = require('../models/User');
const path = require('path')

module.exports = class EventosControllers {
    static async showEventos(req, res) {
        try {
            const eventosData = await Evento.findAll();
            const eventos = eventosData.map((result) => {
                const evento = result.dataValues;
                const data = new Date(evento.data);
                const dataLimite = new Date(evento.datalimite); 
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
                }); // Formatação da dataLimite
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
            imagePath: req.file ? req.file.path:null,
            title: req.body.title,
            local: req.body.local,
            participantes: parseInt(req.body.participantes, 10),
            data: req.body.data,
            datalimite: req.body.datalimite, // Adicionando datalimite
            palestrantes: req.body.palestrantes, // Novos campos
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
    
        // Validações
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
    
    
    
    
    
    
}
