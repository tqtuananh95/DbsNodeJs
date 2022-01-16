const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

// init app
const app = express();

// Border parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
    messages: {}
}));

// Express validtor middleware
app.post('/user',
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }),
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        User.create({
            username: req.body.username,
            password: req.body.password,
        }).then(user => res.json(user));
    },
);

// Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = req.flash();
    next();
});

// Connect to db
mongoose.connect(config.database);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error!'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global folder
app.locals.errors = null;

// models Page
const Page = require('./models/page');

Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
    if (err) {
        console.log(err);
    } else { 
        app.locals.pages = pages;
    }
});

// models Page
const Category = require('./models/category');

// Get all categories to pass to header
Category.find(function(err, categories) {
    if (err) {
        console.log(err);
    } else { 
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware
app.use(fileUpload());

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
    res.locals.cart = session.cart;
    res.locals.message = session.messages;
    res.locals.user = session.user || null;
    next();
});

// Set routes
const indexs = require('./routes/page');
const adminPage = require('./routes/admin_page');
const categoryAdminPage = require('./routes/category_page');
const productAdminPage = require('./routes/product_page');
const products = require('./routes/product');
const cart = require('./routes/cart');
const users = require('./routes/users');

app.use('/', indexs);
app.use('/home', indexs);
app.use('/admin', adminPage);
app.use('/category', categoryAdminPage);
app.use('/product', productAdminPage);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);

// Start the server
const port = 3000;
app.listen(port, function() {
    console.log('Server started on port' + port);
});