const router = require('express').Router();

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        db.query('SELECT * FROM categories', (err, results) => {
            if (err) throw err;
            res.render('intranet', {
                user: req.user,
                meta: { 
                    title: 'Intranet', 
                    description: 'Bienvenido a la intranet de "A un clip", aqui podras comprar el material escolar o de oficina que necesites.',
                    scripts: [
                        { 
                            src: '/js/footer.js' 
                        }
                    ]
                },
                categories: results,
                
            });
        });
        
    } else {
        res.redirect('/login');
    }
});

module.exports = router;