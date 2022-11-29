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

const deleteProductMeta = {
    meta: {
        title: 'Eliminar Producto',
        description: 'Elimina un producto de la tienda',
        scripts: scripts
    }
}

const editProductMeta = {
    meta: {
        title: 'Editar Producto',
        description: 'Edita un producto de la tienda',
        scripts: scripts
    }
}

const viewProductMeta = {
    meta: {
        title: 'Productos',
        description: 'Lista de productos de la tienda',
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

router.get('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.render('products/delete', {
                    ...deleteProductMeta,
                    info: results[0],
                });
            } else {
                res.redirect('/intranet/');
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        db.query('DELETE FROM products WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            res.redirect('/intranet/');
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/edit/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                db.query('SELECT * FROM categories', (err, categories) => {
                    if (err) throw err;
                    res.render('products/edit', {
                        ...editProductMeta,
                        info: results[0],
                        categories: categories,
                    });
                });
            } else {
                res.redirect('/intranet/');
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/edit/:id', upload.single('image'), (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        const image = req.file.filename;
        
        // Check if all fields are filled
        if (!name || !description || !price || !category) {
            // Check if image if have a new image, if have a new image, check if is an image
            if (image) {
                db.query('UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?', [name, description, price, category, req.protocol + '://' + req.get('host') + '/uploads/' + image, stock, id], (err, results) => {
                    if (err) throw err;
                    res.redirect('/intranet/');
                });
            } else {
                db.query('UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ? WHERE id = ?', [name, description, price, category, stock, id], (err, results) => {
                    if (err) throw err;
                    res.redirect('/intranet/');
                });
            }
        } else {
            // Check if image is an image
            if (path.extname(image) == '.jpg' || path.extname(image) == '.png' || path.extname(image) == '.jpeg') {
                db.query('UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?', [name, description, price, category, req.protocol + '://' + req.get('host') + '/uploads/' + image, stock, id], (err, results) => {
                    if (err) throw err;
                    res.redirect('/intranet/');
                });
            } else {
                db.query('SELECT * FROM categories', (err, results) => {
                    if (err) throw err;
                    res.render('products/edit', {
                        ...editProductMeta,
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

router.get('/view/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const { id } = req.params;
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.render('products/view', {
                    ...viewProductMeta,
                    info: results[0],
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