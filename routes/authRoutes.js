const express = require('express')
const router = express.Router()
const AuthControllers = require('../controllers/AuthControllers')
const EventosControllers = require('../controllers/EventosControllers')
const checkAuth = require('../helpers/checkAuth')

router.get('/login', AuthControllers.login)
router.post('/login', AuthControllers.loginPost)
router.get('/register', AuthControllers.register)
router.post('/register', AuthControllers.registerPost)
router.get('/logout', AuthControllers.logout)
router.post('/profile/update-matricula', checkAuth, EventosControllers.updateMatricula)
router.post('/profile/update-password', checkAuth, EventosControllers.updatePassword)

module.exports = router