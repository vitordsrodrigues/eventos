const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports = class AuthControllers{

    static login(req,res){
        res.render('auth/login')
    }
    static register(req, res){
        res.render('auth/register')
    }
    static registerPost(req, res){
        const {name, email,password,confirmpassword, matricula} = req.body

        if(password != confirmpassword){
            req.flash('message','As senhas não conferem, tente novamente')
            res.render('auth/register')

            return
        }
    }
}