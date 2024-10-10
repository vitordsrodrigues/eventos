const Evento = require('../models/Evento')
const User = require('../models/User')

module.exports = class EventosControllers{
    static async showEventos(req,res){
        res.render('eventos/home')
    }
    static async dashboard(req,res){
        res.render('eventos/dashboard')
    }

    static createEvento(req,res){
        res.render('eventos/create')
    }

    static async createEventoSave(req,res){
        const evento = {
            title: req.body.title,
            UserId: req.session.userid
        }
        try{
            await Evento.create(evento)

            req.flash('message', 'evento criado com sucesso')

            req.session.save(()=>{
                res.redirect('/eventos/dashboard')
            })
        }catch(error){
            console.log(error)
        }
         
    }
}