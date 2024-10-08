const Evento = require('../models/Evento')
const User = require('../models/User')

module.exports = class EventosControllers{
    static async showEventos(req,res){
        res.render('eventos/home')
    }
    static async dashboard(req,res){
        res.render('eventos/dashboard')
    }
}