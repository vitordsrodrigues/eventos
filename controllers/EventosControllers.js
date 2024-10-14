const Evento = require('../models/Evento');
const User = require('../models/User');

module.exports = class EventosControllers {
    static async showEventos(req, res) {
        try {
            const eventosData = await Evento.findAll();
            const eventos = eventosData.map((result) => {
                const evento = result.dataValues;
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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
            const eventos = eventosData.map((result) => result.dataValues);

           
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

    static async createEventoSave(req, res) {
        const evento = {
            title: req.body.title,
            local: req.body.local,
            participantes: parseInt(req.body.participantes, 10),
            data: req.body.data,
            UserId: req.session.userid,
        };

        if (!evento.title || !evento.local || !evento.participantes || !evento.data) {
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

    static async removeEvento(req, res) {
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
}
