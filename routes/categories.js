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

const metaNewCategory = {
    meta: {
        title: 'Nueva categoría',
        description: 'Crea una nueva categoría para poder vender productos en "A un clip".',
        scripts: scripts
    }
}

const metaDeleteCategory = {
    meta: {
        title: 'Eliminar categoría',
        description: 'Elimina una categoría de "A un clip".',
        scripts: scripts
    }
}

const metaDeleteAllCategory = {
    meta: {
        title: 'Eliminar todos los productos de una categoría',
        description: 'Elimina todos los productos de una categoría de "A un clip".',
        scripts: scripts
    }
}

const metaViewCategory = {
    meta: {
        title: 'Ver categoría',
        description: 'Ver una categoría de "A un clip".',
        scripts: scripts
    }
}

const metaEditCategory = {
    meta: {
        title: 'Editar categoría',
        description: 'Edita una categoría de "A un clip".',
        scripts: scripts
    }
}

router.get('/new', (req, res) => {
    if (req.isAuthenticated()) {

        res.render('categories/new', {
            ...metaNewCategory,
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/new', upload.single('image'), (req, res) => {
    if (req.isAuthenticated()) {

        const name = req.body.name;
        const description = req.body.description;
        const image = req.file;
        const id = uuidv4();

        //Check if the image is under 1MB
        if (image.size > 1000000) {
            res.render('categories/new', {
                ...metaNewCategory,
                hasMessages: true,
                messages: [{
                    type: 'error',
                    message: 'La imagen no puede pesar más de 1MB'
                }]
            });
        } else {
            // Check if the image is a valid image
            if (image.mimetype === 'image/jpeg' || image.mimetype === 'image/png') {
                // Check if the image has a valid extension
                if (image.originalname.endsWith('.jpg') || image.originalname.endsWith('.jpeg') || image.originalname.endsWith('.png')) {
                    // Check if the name is not empty
                    if (name !== '') {
                        // Check if the description is not empty
                        if (description !== '') {
                            // Check if the image is not empty
                            if (image !== '') {
                                // Check if the category already exists
                                db.query('SELECT * FROM categories WHERE name = ?', [name], (err, results) => {
                                    if (err) throw err;
                                    if (results.length > 0) {
                                        res.render('categories/new', {
                                            ...metaNewCategory,
                                            hasMessages: true,
                                            messages: [{
                                                type: 'error',
                                                message: 'La categoría ya existe'
                                            }]
                                        });
                                    } else {
                                        db.query('INSERT INTO categories SET ?', { id: id, name: name, description: description, image: req.protocol + '://' + req.get('host') + '/uploads/' + image.filename }, (err, results) => {
                                            if (err) throw err;
                                            res.redirect('/intranet/');
                                        });
                                    }
                                });
                            } else {
                                res.render('categories/new', {
                                    ...metaNewCategory,
                                    hasMessages: true,
                                    messages: [{
                                        type: 'error',
                                        message: 'La imagen no puede estar vacía'
                                    }]
                                });
                            }
                        } else {
                            res.render('categories/new', {
                                ...metaNewCategory,
                                hasMessages: true,
                                messages: [{
                                    type: 'error',
                                    message: 'La descripción no puede estar vacía'
                                }]
                            });
                        }
                    } else {
                        res.render('categories/new', {
                            ...metaNewCategory,
                            hasMessages: true,
                            messages: [{
                                type: 'error',
                                message: 'El nombre no puede estar vacío'
                            }]
                        });
                    }
                } else {
                    res.render('categories/new', {
                        ...metaNewCategory,
                        hasMessages: true,
                        messages: [{
                            type: 'error',
                            message: 'La imagen debe tener una extensión válida'
                        }]
                    });
                }
            } else {
                res.render('categories/new', {
                    ...metaNewCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La imagen debe ser un archivo válido'
                    }]
                });
            }
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        // Check if the category exists
        db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                // Check if the category has products
                db.query('SELECT * FROM products WHERE category = ?', [req.params.id], (err, resultsProducts) => {
                    if (err) throw err;
                    if (resultsProducts.length > 0) {
                        res.render('categories/delete', {
                            ...metaDeleteCategory,
                            hasMessages: true,
                            messages: [{
                                type: 'error',
                                message: 'No puedes eliminar una categoría que tenga productos'
                            }]
                        });
                    } else {
                        res.render('categories/delete', {
                            ...metaDeleteCategory,
                            info: results[0]
                        });
                    }
                });
            } else {
                res.render('categories/delete', {
                    ...metaDeleteCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La categoría no existe'
                    }]
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        //Check if req.body.confirmation exist //Is a checkbox
        if (req.body.confirmation) {

            // Check if the category exists
            db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    // Check if the category has products
                    db.query('SELECT * FROM products WHERE category = ?', [req.params.id], (err, resultsProducts) => {
                        if (err) throw err;
                        if (resultsProducts.length > 0) {
                            res.render('categories/delete', {
                                meta: {
                                    title: 'Eliminar categoría',
                                    description: 'Elimina una categoría de "A un clip".',
                                    scripts: [
                                        {
                                            src: '/js/reloadImage.js'
                                        }
                                    ]
                                },
                                hasMessages: true,
                                messages: [{
                                    type: 'error',
                                    message: 'No puedes eliminar una categoría que tenga productos'
                                }]
                            });
                        } else {
                            db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err, results) => {
                                if (err) throw err;
                                res.redirect('/intranet/');
                            });
                        }
                    });
                } else {
                    res.render('categories/delete', {
                        meta: {
                            title: 'Eliminar categoría',
                            description: 'Elimina una categoría de "A un clip".',
                            scripts: [
                                {
                                    src: '/js/reloadImage.js'
                                }
                            ]
                        },
                        hasMessages: true,
                        messages: [{
                            type: 'error',
                            message: 'La categoría no existe'
                        }]
                    });
                }
            });

        } else {
            res.render('categories/delete', {
                ...metaDeleteCategory,
                hasMessages: true,
                messages: [{
                    type: 'error',
                    message: 'Debes confirmar la eliminación'
                }]
            });
        }

    } else {
        res.redirect('/login');
    }
});

router.get('/deleteall/:id', (req, res) => {
    if (req.isAuthenticated()) {
        // Check if the category exists
        db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                // Check if the category has products
                db.query('SELECT * FROM products WHERE category = ?', [req.params.id], (err, resultsProducts) => {
                    if (err) throw err;
                    if (resultsProducts.length > 0) {
                        res.render('categories/deleteall', {
                            ...metaDeleteAllCategory,
                            info: results[0]
                        });
                    } else {
                        res.render('categories/deleteall', {
                            ...metaDeleteAllCategory,
                            hasMessages: true,
                            messages: [{
                                type: 'error',
                                message: 'No puedes eliminar los productos de una categoría que no tenga productos'
                            }]
                        });
                    }
                });
            } else {
                res.render('categories/deleteall', {
                    ...metaDeleteAllCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La categoría no existe'
                    }]
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/view/:id', (req, res) => {
    if (req.isAuthenticated()) {
        // Check if the category exists
        db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                // Check if the category has products
                db.query('SELECT * FROM products WHERE category = ?', [req.params.id], (err, resultsProducts) => {
                    if (err) throw err;
                    if (resultsProducts.length > 0) {
                        res.render('categories/view', {
                            ...metaViewCategory,
                            info: results[0],
                            products: resultsProducts
                        });
                    } else {
                        res.render('categories/view', {
                            ...metaViewCategory,
                            info: results[0],
                            hasMessages: true,
                            messages: [{
                                type: 'error',
                                message: 'La categoría no tiene productos'
                            }],
                            products: resultsProducts
                        });
                    }
                });
            } else {
                res.render('categories/view', {
                    ...metaViewCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La categoría no existe'
                    }],
                    products: []
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/deleteall/:id', (req, res) => {
    if (req.isAuthenticated()) {
        //Check if req.body.confirmation exist //Is a checkbox
        if (req.body.confirmation) {

            // Check if the category exists
            db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    // Check if the category has products
                    db.query('SELECT * FROM products WHERE category = ?', [req.params.id], (err, resultsProducts) => {
                        if (err) throw err;
                        if (resultsProducts.length > 0) {
                            db.query('DELETE FROM products WHERE category = ?', [req.params.id], (err, results) => {
                                if (err) throw err;
                                res.redirect('/intranet/');
                            });
                        } else {
                            res.render('categories/deleteall', {
                                ...metaDeleteAllCategory,
                                hasMessages: true,
                                messages: [{
                                    type: 'error',
                                    message: 'No puedes eliminar los productos de una categoría que no tenga productos'
                                }]
                            });
                        }
                    });
                } else {
                    res.render('categories/deleteall', {
                        ...metaDeleteAllCategory,
                        hasMessages: true,
                        messages: [{
                            type: 'error',
                            message: 'La categoría no existe'
                        }]
                    });
                }
            });

        } else {
            res.render('categories/deleteall', {
                ...metaDeleteAllCategory,
                hasMessages: true,
                messages: [{
                    type: 'error',
                    message: 'Debes confirmar la eliminación'
                }]
            });
        }

    } else {
        res.redirect('/login');
    }
});

router.get('/edit/:id', (req, res) => {
    if (req.isAuthenticated()) {
        // Check if the category exists
        db.query('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.render('categories/edit', {
                    ...metaEditCategory,
                    info: results[0]
                });
            } else {
                res.render('categories/edit', {
                    ...metaEditCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La categoría no existe'
                    }]
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/edit/:id', upload.single('image'), (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        const name = req.body.name;
        const description = req.body.description;
        const image = req.file;

        // Check if the category exists
        db.query('SELECT * FROM categories WHERE id = ?', [id], (err, resultsCategory) => {
            if (err) throw err;
            if (resultsCategory.length > 0) {
                // Check if the name is not empty
                if (name != '') {
                    // Check if the description is not empty
                    if (description != '') {
                                // Check if the image is not empty
                                if (image) {
                                    // Check if the image is a valid format
                                    if (image.mimetype == 'image/jpeg' || image.mimetype == 'image/png') {
                                        // Check if the image is not bigger than 2MB
                                        if (image.size < 2000000) {
                                            // Update the category
                                            db.query('UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?', [name, description, req.protocol + '://' + req.get('host') + '/uploads/' + image.filename, id], (err, results) => {
                                                if (err) throw err;
                                                res.redirect('/intranet/');
                                            });
                                        } else {
                                            res.render('categories/edit', {
                                                ...metaEditCategory,
                                                hasMessages: true,
                                                messages: [{
                                                    type: 'error',
                                                    message: 'La imagen no puede pesar más de 2MB'
                                                }],
                                                info: resultsCategory[0]
                                            });
                                        }
                                    } else {
                                        res.render('categories/edit', {
                                            ...metaEditCategory,
                                            hasMessages: true,
                                            messages: [{
                                                type: 'error',
                                                message: 'La imagen debe ser JPG o PNG'
                                            }],
                                            info: resultsCategory[0]
                                        });
                                    }
                                } else {
                                    // Update the category
                                    db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id], (err, results) => {
                                        if (err) throw err;
                                        res.redirect('/intranet/');
                                    });
                                }
                    } else {
                        res.render('categories/edit', {
                            ...metaEditCategory,
                            hasMessages: true,
                            messages: [{
                                type: 'error',
                                message: 'La descripción no puede estar vacía'
                            }],
                            info: resultsCategory[0]
                        });
                    }
                } else {
                    res.render('categories/edit', {
                        ...metaEditCategory,
                        hasMessages: true,
                        messages: [{
                            type: 'error',
                            message: 'El nombre no puede estar vacío'
                        }],
                        info: resultsCategory[0]
                    });
                }
            } else {
                res.render('categories/edit', {
                    ...metaEditCategory,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'La categoría no existe'
                    }]
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;