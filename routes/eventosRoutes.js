const express = require ('express')
const router = express.Router()
const EventosControllers = require('../controllers/EventosControllers')

router.get('/', EventosControllers.showEventos)

module.exports = router