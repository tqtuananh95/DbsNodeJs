const flash = require('connect-flash/lib/flash');
const express = require('express');
const app = express();
const router = express.Router();
const { body, validationResult, check} = require('express-validator');
const bodyParser = require('body-parser');

const Page = require('../models/page');

// Border parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Admin Page
router.get('/', function(req, res) {
    Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
        res.render('./admin/admin_page', {
            pages: pages,
            title: 'Admin Pages'
        });
    });
});

// Add Admin Page
router.get('/add', function(req, res) {
    res.render('./admin/add_admin', {
        title: '',
        slug: '',
        content: '',
        errors: req.session.errors
    });
    req.session.errors = null;
});

// POST add Admin Page
router.post(
    '/add',
    // username must be an email
    body('title').notEmpty(),
    // password must be at least 5 chars long
    body('content').isLength({ min: 5 }),
    (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./admin/add_admin', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content
        });
        req.session.errors = errors;
    } else {
        Page.findOne({slug: slug}, function(err, page) {
            if (page) {
                console.log('save 01');//commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                res.redirect('/admin');
            } else {
                console.log('save 02');
                const page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err) {
                    if (err) return console.log(err);//commonjs.openSnack('Page added!', 3, 'SUCCESS');
                    res.redirect('/admin');
                });
            }
        });
    }
    
});

// POST reorder Admin Page
router.post('/reorder', function(req, res) {
    var ids = req.body['id'];
    console.log(ids);
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function(count) {
        Page.findById(id, function (err, page) {
            page.sorting = count;
            page.save(function (err) {
                if (err) return console.log(err);
            });
        });
        })(count);
    }
});

// Exports
module.exports = router;