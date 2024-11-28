const { UPDATE } = require('sequelize/lib/query-types')
const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports = class AuthControllers {

    static login(req, res) {
        res.render('auth/login')
    }

    static async loginPost(req, res) {
        const { email, password } = req.body

        if (email === 'ContadeAdminCimol@admin.com' && password === 'admin') {
            req.session.userid = 'admin'; 
            req.flash('message', 'Login de administrador realizado com sucesso');
            return req.session.save(() => {
                res.redirect('eventos/dashboard'); 
            });
        }

        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            return res.render('auth/login', {
                error: 'Usuário não encontrado',
                email,
                invalidField: 'email'
            });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password)

        if (!passwordMatch) {
            return res.render('auth/login', {
                error: 'Senha incorreta',
                email,
                invalidField: 'password'
            });
        }

        req.session.userid = user.id

        req.flash('message', 'Login realizado com sucesso')
        req.session.save(() => {
            res.redirect('/')
        })
    }

    static register(req, res) {
        res.render('auth/register')
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword, matricula } = req.body

        if (password != confirmpassword) {
            return res.render('auth/register', {
                error: 'As senhas não conferem',
                name,
                email,
                matricula,
                invalidField: 'confirmpassword'
            });
        }

        const checkifUserExist = await User.findOne({ where: { email: email } })
        if (checkifUserExist) {
            return res.render('auth/register', {
                error: 'O email já está em uso',
                name,
                matricula,
                invalidField: 'email'
            });
        }

        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        const user = {
            name,
            email,
            matricula,
            password: hashedPassword
        }

        try {
            const createdUser = await User.create(user)

            req.session.userid = createdUser.id

            req.flash('message', 'Cadastro realizado com sucesso')
            req.session.save(() => {
                res.redirect('/')
            })
        } catch (err) {
            console.log(err)
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
}
