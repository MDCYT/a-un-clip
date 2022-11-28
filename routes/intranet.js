const router = require('express').Router();

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('intranet', {
            user: req.user,
            meta: { 
                title: 'Intranet', 
                description: 'Bienvenido a la intranet de "A un clip", aqui podras comprar el material escolar o de oficina que necesites.'
            }
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;