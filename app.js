const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const flash = require("connect-flash");
var createError = require('http-errors');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const db = require('./utils/db');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const options = {
    host: process.env.MYSQL_HOST,
    port: 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

const sessionStore = new MySQLStore(options);

global.db = db;
global.__basedir = __dirname;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// ejs template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//Session
app.use(session({
    key: 'Super Duper Hyper Secret Key',
    secret: 'This Is a Secret String',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//Variables Globales
app.use(function (req, res, next) {
    var msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];

    console.log(msgs);
    next();
});

//Delete x-powered-by header
app.disable('x-powered-by');
//Add custom header
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'MDCDEV');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Discord-Server', 'https://discord.gg/Dae');

    next();
});


// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/index'));
app.use('/intranet', require('./routes/intranet'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});