function checkAuth(req, res, next) {
    if (!req.session.userid) {
        req.flash('message', 'Por favor, faça login para acessar esta página');
        return res.redirect('/login');
    }
    next();
}

module.exports = checkAuth; 