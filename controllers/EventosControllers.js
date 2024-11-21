const Evento = require('../models/Evento');
const User = require('../models/User');
const path = require('path')
const Participacao = require('../models/Participacao');
const {Op} = require('sequelize')
const Sugestao = require('../models/Sugestao');
const bcrypt = require('bcrypt');

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
                const user = await User.findOne({ 
                    where: { id: userId },
                    attributes: ['id', 'name', 'email', 'matricula', 'imagem'] // Incluir todos os campos necessários
                });
                userName = user ? user.name : null;
                layout = 'main-users';
                
                // Passar o objeto user completo
                req.session.user = user;
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
                    user: req.session.user // Passar o objeto user completo
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

            
            const eventosData = await Evento.findAll({
                order: [['createdAt', 'DESC']]
            });

            
            const eventos = eventosData.map(evento => {
                const data = new Date(evento.data);
                const dataLimite = new Date(evento.datalimite);
                return {
                    ...evento.dataValues,
                    dataFormatada: data.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    }),
                    dataLimiteFormatada: dataLimite.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    })
                };
            });

           
            const sugestoesRaw = await Sugestao.findAll({
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']]
            });

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
                    eventos,
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
            requerMatricula: req.body.requerMatricula === 'on',
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
        try {
            const { id } = req.body;
            const userId = req.session.userid;

            if (!id || !userId) {
                return res.status(400).json({ error: 'Dados inválidos' });
            }

            const evento = await Evento.findByPk(id);
            if (!evento) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }

            // Verificar se o evento requer matrícula
            if (evento.requerMatricula) {
                const user = await User.findByPk(userId);
                if (!user.matricula) {
                    return res.status(403).json({ 
                        error: 'Este evento requer matrícula cadastrada',
                        requiresRegistration: true 
                    });
                }
            }

            if (evento.participantesAtuais >= evento.participantes) {
                return res.status(400).json({ error: 'Evento lotado' });
            }

            const participacaoExistente = await Participacao.findOne({
                where: {
                    EventoId: id,
                    UserId: userId
                }
            });

            if (participacaoExistente) {
                return res.status(400).json({ error: 'Você já está participando deste evento' });
            }

            await Participacao.create({
                EventoId: id,
                UserId: userId
            });

            evento.participantesAtuais += 1;
            await evento.save();

            return res.json({
                success: true,
                participantesAtuais: evento.participantesAtuais
            });

        } catch (error) {
            console.error('Erro ao participar do evento:', error);
            return res.status(500).json({ error: 'Erro interno ao participar do evento' });
        }
    }
    


static async cancelarParticipacao(req, res) {
    try {
        const { id } = req.body;
        const userId = req.session.userid;

        if (!id || !userId) {
            return res.status(400).json({ 
                error: 'Dados inválidos para cancelar participação' 
            });
        }

        // Encontrar a participação
        const participacao = await Participacao.findOne({
            where: {
                EventoId: id,
                UserId: userId
            }
        });

        if (!participacao) {
            return res.status(404).json({ 
                error: 'Participação não encontrada' 
            });
        }

        // Encontrar o evento
        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ 
                error: 'Evento não encontrado' 
            });
        }

        // Deletar a participação
        await participacao.destroy();

        // Atualizar o número de participantes
        evento.participantesAtuais = Math.max(0, evento.participantesAtuais - 1);
        await evento.save();

        return res.json({ 
            success: true, 
            participantesAtuais: evento.participantesAtuais 
        });

    } catch (error) {
        console.error('Erro ao cancelar participação:', error);
        return res.status(500).json({ 
            error: 'Erro interno ao cancelar participação' 
        });
    }
}

    static async eventosParticipando(req, res) {
        try {
            const userId = req.session.userid;
            
            // Buscar usuário com todos os atributos necessários
            const user = await User.findOne({ 
                where: { id: userId },
                attributes: ['id', 'name', 'email', 'matricula', 'imagem'] // Incluir imagem
            });

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

            res.render('eventos/eventos-participando', {
                eventos,
                userName: user.name,
                user, // Passar o objeto user completo
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
            
            // Buscar usuário com todos os campos necessários
            const user = await User.findOne({ 
                where: { id: userId },
                attributes: ['id', 'name', 'email', 'matricula', 'imagem'] // Incluindo imagem
            });

            // Contar participações
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

            // Buscar usuário com todos os atributos necessários
            const user = await User.findOne({ 
                where: { id: userId },
                attributes: ['id', 'name', 'email', 'matricula', 'imagem'] // Incluir imagem
            });

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

            res.render('eventos/meus-eventos', {
                eventos,
                userName: user.name,
                user, // Passar o objeto user completo
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
            const user = await User.findOne({ 
                where: { id: userId },
                attributes: ['id', 'name', 'email', 'matricula', 'imagem'] // Incluir imagem
            });

            res.render('eventos/sugestoes', {
                userName: user.name,
                userEmail: user.email,
                user, // Passar o objeto user completo
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

    static async showConfirmacao(req, res) {
        try {
            const id = req.params.id;
            const evento = await Evento.findByPk(id);
            
            if (!evento) {
                req.flash('message', 'Evento não encontrado');
                return res.redirect('/');
            }

            // Formatar a data
            evento.dataFormatada = evento.data.toLocaleDateString('pt-BR');
            
            res.render('eventos/confirmacao', { evento });
        } catch (error) {
            console.error('Erro ao mostrar confirmação:', error);
            req.flash('message', 'Erro ao carregar página de confirmação');
            res.redirect('/');
        }
    }

    static async updateMatricula(req, res) {
        try {
            const userId = req.session.userid;
            const { matricula } = req.body;

            if (!matricula) {
                return res.json({
                    error: true,
                    message: 'Por favor, forneça uma matrícula válida'
                });
            }

            await User.update(
                { matricula: matricula },
                { where: { id: userId } }
            );

            res.json({
                error: false,
                message: 'Matrícula atualizada com sucesso!',
                matricula: matricula
            });
        } catch (error) {
            console.error('Erro ao atualizar matrícula:', error);
            res.json({
                error: true,
                message: 'Erro ao atualizar matrícula'
            });
        }
    }

    static async updatePassword(req, res) {
        try {
            const userId = req.session.userid;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.json({
                    error: true,
                    message: 'Por favor, preencha todos os campos de senha'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.json({
                    error: true,
                    message: 'A nova senha e a confirmação não correspondem'
                });
            }

            const user = await User.findByPk(userId);
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            
            if (!isPasswordValid) {
                return res.json({
                    error: true,
                    message: 'Senha atual incorreta'
                });
            }

            if (await bcrypt.compare(newPassword, user.password)) {
                return res.json({
                    error: true,
                    message: 'A nova senha não pode ser igual à senha atual'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await User.update(
                { password: hashedPassword },
                { where: { id: userId } }
            );

            res.json({
                error: false,
                message: 'Senha atualizada com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            res.json({
                error: true,
                message: 'Erro ao atualizar senha'
            });
        }
    }

    static async updateProfileImage(req, res) {
        try {
            const userId = req.session.userid;
            console.log('Iniciando upload de imagem para usuário:', userId);
            console.log('Arquivo recebido:', req.file);
            
            if (!req.file) {
                console.log('Nenhum arquivo recebido');
                return res.json({
                    error: true,
                    message: 'Nenhuma imagem foi enviada'
                });
            }

            console.log('Atualizando usuário com nova imagem:', req.file.filename);
            
            await User.update(
                { imagem: req.file.filename },
                { where: { id: userId } }
            );

            console.log('Imagem atualizada com sucesso');

            res.json({
                error: false,
                message: 'Imagem atualizada com sucesso!',
                imagePath: `/uploads/${req.file.filename}`
            });
        } catch (error) {
            console.error('Erro completo ao atualizar imagem:', error);
            res.json({
                error: true,
                message: 'Erro ao atualizar imagem: ' + error.message
            });
        }
    }
}


