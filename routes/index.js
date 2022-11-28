const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index', { 
        meta: { 
            title: 'Inicio', 
            description: 'Bienvenido a la página de inicio de "A un clip", aqui podras comprar el material escolar o de oficina que necesites.',
            scripts: [
                { 
                    src: '/js/footer.js' 
                },
                {
                    src: '/js/cartItems.js'
                }
            ]
        } });
});

module.exports = router;