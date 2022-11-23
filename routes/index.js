const router = require('express').Router();
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

passport.use(new LocalStrategy(async (username, password, done) => {
    db.query('SELECT * FROM users WHERE username = ?', [username.toLowerCase()], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, results[0].password, (err, res) => {
            if (err) throw err;
            if (res) {
                return done(null, results[0]);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
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

router.get('/', (req, res) => {
    res.render('index', { meta: { title: 'Inicio', description: 'Bienvenido a la página de inicio de "A un clip", aqui podras comprar el material escolar o de oficina que necesites.' } });
});

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('register', { meta: { title: 'Registro', description: 'Registrate en "A un clip" para poder comprar el material escolar o de oficina que necesites.' } });
    }
});

router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    check('password2', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array()
        });
    } else {
        const username = req.body.username.toLowerCase();
        // Check if username already exists
        db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.render('register', {
                    message: 'Username already exists'
                });
            } else {
                const password = req.body.password;
                const level = 1;
                const id = uuidv4();
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        const sql = 'INSERT INTO users (id, username, password, level) VALUES (?, ?, ?, ?)';
                        db.query(sql, [id, username, hash, level], (err, result) => {
                            if (err) throw err;
                            res.redirect('/login');
                        });
                    });
                })
            }
        });
    }
});

router.get('/login', (req, res) => {
    // If the user is already logged in, redirect to the dashboard
    if (req.isAuthenticated()) {
        res.redirect('/intranet');
    } else {
        res.render('login', {
            errors: [],
            meta: { title: 'Iniciar sesión', description: 'Inicia sesión en "A un clip" para poder comprar el material escolar o de oficina que necesites.' }
        });
    }
});

router.post('/login', [
    check('username', 'Porfavor, ingrese un nombre de usuario').not().isEmpty(),
    check('password', 'Porfavor, ingrese una contraseña').not().isEmpty()
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('login', {
            errors: errors.array()
        });
    } else {
        passport.authenticate('local', {
            successRedirect: '/intranet',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) throw err;
        res.redirect('/');
    });
});

router.get('/intranet', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('intranet', {
            user: req.user,
            meta: { title: 'Intranet', description: 'Bienvenido a la intranet de "A un clip", aqui podras comprar el material escolar o de oficina que necesites.' }
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;