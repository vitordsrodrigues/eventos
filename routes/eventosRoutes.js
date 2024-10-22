const express = require ('express')
const router = express.Router()
const EventosControllers = require('../controllers/EventosControllers')
const checkAuth = require('../helpers/auth').checkAuth
const upload = require('../helpers/image-upload')

router.get('/add',checkAuth, EventosControllers.createEvento)
router.post('/add',checkAuth,upload.single('image'), EventosControllers.createEventoSave)
router.get('/dashboard',checkAuth, EventosControllers.dashboard)
router.post('/remove',checkAuth,EventosControllers.removeEvento)
router.get('/', EventosControllers.showEventos)

module.exports = router