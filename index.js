const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')



const Evento = require('./models/Evento')
const User = require('./models/User')
const EventosControllers = require('./controllers/EventosControllers')
const Participacao = require('./models/Participacao')


const eventosRoutes = require('./routes/eventosRoutes')
const authRoutes = require('./routes/authRoutes')


const hbs = exphbs.create({
    helpers: {
        dataISO: function(data) {
            if (!data) return '';
            const date = new Date(data);
            return date.toISOString().split('T')[0];
        },
        isEventoAtivo: function(datalimite) {
            const hoje = new Date();
            const dataLimite = new Date(datalimite);
            
            
            hoje.setHours(0, 0, 0, 0);
            dataLimite.setHours(0, 0, 0, 0);
            
            return dataLimite >= hoje;
        },
        isEventoEsgotado: function(participantesAtuais, participantesMax) {
            return participantesAtuais >= participantesMax;
        },
        temPermissaoBusca: function(userid) {
            // Se for admin, retorna falso (sem permissão)
            if (userid === null||userid === 'admin') return false;

            // Outros usuários têm permissão
            return !!userid; // Verifica se o userid existe
        }
    }
});


app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(
    express.urlencoded({
        extended:true
    })
)
app.use(express.json())

app.use(
    session({
        name:'session',
        secret:'nosso_secret',
        resave:false,
        saveUninitialized:false,
        store: new FileStore({
            logFn: function(){},
            path: require('path').join(require('os').tmpdir(), 'sessions'),
        }),
        cookie:{
            secure:false,
            maxAge:360000,
            expires: new Date(Date.now()+360000),
            httpOnly:true
        }
    }),
)

app.use(flash())
app.use(express.static('public'))

app.use((req,res,next)=>{
    if(req.session.userid){
        res.locals.session = req.session
    }
    next()
})

app.get('/eventos-participando', (req, res) => {
    res.render('eventos-participando', { title: 'Eventos Participando' });
});

app.use('/eventos',eventosRoutes)
app.use('/',authRoutes)
app.get('/',EventosControllers.showEventos)

app.get('/profile', checkAuth, EventosControllers.showProfile);

User.hasMany(Participacao);
Participacao.belongsTo(User);

Evento.hasMany(Participacao);
Participacao.belongsTo(Evento);

function checkAuth(req, res, next) {
    if (!req.session.userid) {
        req.flash('message', 'Por favor, faça login para acessar esta página');
        return res.redirect('/login');
    }
    next();
}

conn
    .sync()
    //.sync({force:true})
    .then(() => {
        console.log('Banco de dados sincronizado');
        app.listen(3000);
    })
    .catch((err) => console.log(err));
