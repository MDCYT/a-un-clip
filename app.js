const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const flash = require("connect-flash");

if(process.env.NODE_ENV !== 'production') require('dotenv').config();

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
app.use((req, res, next) => {
    app.locals.success = req.flash("success");
    app.locals.error = req.flash("error");
    app.locals.user = req.user
    next();
  });


// Routes
app.use('/', require('./routes/index'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });