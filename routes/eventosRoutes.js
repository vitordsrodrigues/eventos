const express = require('express');
const router = express.Router();
const EventosControllers = require('../controllers/EventosControllers');
const checkAuth = require('../helpers/auth').checkAuth;
const Participacao = require('../models/Participacao'); 


router.get('/add', checkAuth, EventosControllers.createEvento);
router.post('/add', checkAuth, EventosControllers.createEventoSave);
router.get('/dashboard', checkAuth, EventosControllers.dashboard);
router.post('/remove', checkAuth, EventosControllers.removeEvento);
router.get('/edit/:id', checkAuth, EventosControllers.editEvento);
router.post('/edit', checkAuth, EventosControllers.editEventoSave); 
router.get('/', EventosControllers.showEventos);
router.post('/participar', checkAuth, EventosControllers.participarEvento);
router.post('/cancelar', checkAuth, EventosControllers.cancelarParticipacao);




module.exports = router;
