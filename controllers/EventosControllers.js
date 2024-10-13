const Evento = require('../models/Evento')
const User = require('../models/User')

module.exports = class EventosControllers{
    static async showEventos(req,res){

        const eventosData = await Evento.findAll()
        const eventos = eventosData.map((result)=>result.dataValues)
        
        res.render('eventos/home', { eventos })
    }
    static async dashboard(req,res){
        const eventosData = await Evento.findAll()
        const eventos = eventosData.map((result)=>result.dataValues)
        
        res.render('eventos/dashboard', {eventos})
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

    static async removeEvento(req,res){
        const id = req.body.id

        await Evento.destroy({where:{id:id}})

        req.flash('message','evento removido')
        req.session.save(()=>{
            res.redirect('/eventos/dashboard')
        })
    }
}