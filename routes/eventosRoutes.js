const express = require('express');
const router = express.Router();
const EventosControllers = require('../controllers/EventosControllers');
const checkAuth = require('../helpers/auth').checkAuth;
const Participacao = require('../models/Participacao'); 


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Erro: Apenas imagens são permitidas!');
        }
    }
});

router.get('/add', checkAuth, EventosControllers.createEvento);
router.post('/add', checkAuth, upload.single('imagem'), EventosControllers.createEventoSave);
router.get('/dashboard', checkAuth, EventosControllers.dashboard);
router.post('/remove', checkAuth, EventosControllers.removeEvento);
router.get('/edit/:id', checkAuth, EventosControllers.editEvento);
router.post('/edit', checkAuth, EventosControllers.editEventoSave); 
router.get('/', EventosControllers.showEventos);
router.post('/participar', checkAuth, EventosControllers.participarEvento);
router.post('/cancelar', checkAuth, EventosControllers.cancelarParticipacao);




module.exports = router;
