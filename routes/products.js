const router = require('express').Router();
// import uuidv4 npm package
const { v4: uuidv4 } = require('uuid');
const multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })
const path = require('path');

const scripts = [
    
    { 
        src: '/js/footer.js' 
    },
    {
        src: '/js/reloadImage.js'
    }
]

const newProductMeta = {
    meta: {
        title: 'Nuevo Producto',
        description: 'Agrega un nuevo producto a la tienda',
        scripts: scripts
    }
}

router.get('/new', (req, res) => {
    if (req.isAuthenticated()) {
        db.query('SELECT * FROM categories', (err, results) => {
            if (err) throw err;
            res.render('products/new', {
                ...newProductMeta,
                categories: results,
            });
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/new', upload.single('image'), (req, res) => {
    if (req.isAuthenticated()) {
        const { name, description, price, category, stock } = req.body;
        const image = req.file.filename;
        const id = uuidv4();
        
        // Check if all fields are filled
        if (!name || !description || !price || !category || !image) {
            db.query('SELECT * FROM categories', (err, results) => {
                if (err) throw err;
                res.render('products/new', {
                    ...newProductMeta,
                    categories: results,
                    hasMessages: true,
                    messages: [
                        {
                            type: 'error',
                            text: 'Por favor, rellena todos los campos'
                        }
                    ]
                });
            });
        } else {
            // Check if image is an image
            if (path.extname(image) == '.jpg' || path.extname(image) == '.png' || path.extname(image) == '.jpeg') {
                db.query('INSERT INTO products SET ?', { id, name, description, price, category, image: req.protocol + '://' + req.get('host') + '/uploads/' + image, stock }, (err, results) => {
                    if (err) throw err;
                    res.redirect('/intranet');
                });
            } else {
                db.query('SELECT * FROM categories', (err, results) => {
                    if (err) throw err;
                    res.render('products/new', {
                        ...newProductMeta,
                        categories: results,
                        hasMessages: true,
                        messages: [
                            {
                                type: 'error',
                                text: 'Por favor, sube una imagen'
                            }
                        ]
                    });
                });
            }
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/new/:id', upload.single('image'), (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.render('products/new', {
                    ...newProductMeta,
                    categories: results,
                });
            } else {
                res.redirect('/intranet/');
            }
        });
    } else {
        res.redirect('/login');
    }
});



module.exports = router;