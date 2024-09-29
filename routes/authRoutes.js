const express = require('express')
const router = express.Router()
const AuthControllers = require('../controllers/AuthControllers')

router.get('/login', AuthControllers.login)
router.get('/register', AuthControllers.register)
router.post('/register', AuthControllers.registerPost)

module.exports = router