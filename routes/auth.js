const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const defaultRegisterOptions = {
    meta: {
        title: 'Registro',
        description: 'Registrate en "A un clip" para poder comprar el material escolar o de oficina que necesites.'
    }
}
const defaultLoginOptions = {
    meta: { 
        title: 'Iniciar sesión', 
        description: 'Inicia sesión en "A un clip" para poder comprar el material escolar o de oficina que necesites.' 
    }
}

passport.use(new LocalStrategy(async (username, password, done) => {
    db.query('SELECT * FROM users WHERE username = ?', [username.toLowerCase()], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return done(null, false, { message: 'Nombre de usuario o contraseña incorrectos' });
        }
        bcrypt.compare(password, results[0].password, (err, res) => {
            if (err) throw err;
            if (res) {
                return done(null, results[0]);
            } else {
                return done(null, false, { message: 'Nombre de usuario o contraseña incorrectos' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        return done(null, results[0]);
    });
});


router.get('/registerAdmin', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('registerAdmin', defaultRegisterOptions);
    }
});

router.post('/registerAdmin', (req, res, next) => {

    const username = req.body.username.toLowerCase();
    // Check if username already exists
    db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
        if (err) { return next(err); }
        if (results.length > 0) {
            res.render('registerAdmin', {
                ...defaultRegisterOptions,
                hasMessages: true,
                messages: [{
                    type: 'error',
                    message: 'El nombre de usuario ya existe'
                }]
            });
        } else {
            // Check if passwords match
            if (req.body.password === req.body.password2) {
                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) { return next(err); }
                        // Store user
                        db.query('INSERT INTO users SET ?', { id: uuidv4(), username: username, password: hash, role: 'admin' }, (err, results) => {
                            if (err) { return next(err); }
                            req.session.messages = [{ type: 'success', message: 'Usuario registrado correctamente' }];
                            res.redirect('/login');
                        });
                    });
                });
            } else {
                res.render('registerAdmin', {
                    ...defaultRegisterOptions,
                    hasMessages: true,
                    messages: [{
                        type: 'error',
                        message: 'Las contraseñas no coinciden'
                    }]
                });
            }
        }
    });
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('login', {
            ...defaultLoginOptions,
            hasMessages: true,
            messages: errors.array().map(error => {
                return {
                    type: 'error',
                    message: error.msg
                }
            })
        });
    } else {
        //Check if notAuth query param is present
        if (req.query.notAuth) {
            res.render('login', {
                ...defaultLoginOptions,
                hasMessages: true,
                messages: [{
                    type: 'error',
                    message: 'Usuario o contraseña incorrectos'
                }]
            });
        } else {
            res.render('login', defaultLoginOptions);
        }
    }

});

router.post('/login', [
    check('username', 'Porfavor, ingrese un nombre de usuario').not().isEmpty(),
    check('password', 'Porfavor, ingrese una contraseña').not().isEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('login', {
            ...defaultLoginOptions,
            hasMessages: true,
            messages: errors.array().map(error => {
                return {
                    type: 'error',
                    message: error.msg
                }
            })
        });
    } else {
        passport.authenticate('local', {
            successRedirect: '/intranet',
            failureRedirect: '/login?notAuth=true',
            failureFlash: true
        })(req, res, next)
    }
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) throw err;
        res.redirect('/');
    });
});

module.exports = router;
