const express = require ('express')
const router = express.Router()
const EventosControllers = require('../controllers/EventosControllers')

router.get('/dashboard', EventosControllers.dashboard)
router.get('/', EventosControllers.showEventos)

module.exports = router