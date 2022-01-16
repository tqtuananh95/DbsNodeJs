const express = require('express');
const session = require('express-session');
const router = express.Router();
const { body, validationResult, check} = require('express-validator');

const Page = require('../models/page');

// Admin Page
router.get('/', function(req, res) {
    Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
        res.render('./admin/admin_page', {
            pages: pages,
            message: session.messages,
            title: 'Admin Pages'
        });
        session.messages = "";
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
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
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
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                res.redirect('/admin');
            } else {
                const page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err) {
                    if (err) return console.log(err);//commonjs.openSnack('Page added!', 3, 'SUCCESS');

                    Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
                        if (err) {
                            console.log(err);
                        } else { 
                            req.app.locals.pages = pages;
                        }
                    });

                    req.session.messages = {"success": "Successfuly page added!"};
                    session.messages = req.session.messages;
                    res.redirect('/admin');
                });
            }
        });
    }
    
});

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function(count) {
        Page.findById(id, function (err, page) {
            page.sorting = count;
            page.save(function (err) {
                if (err) return console.log(err);
                ++count;
                if (count >= ids.length) {
                    callback();
                }
            });
        });
        })(count);
    }
}
// POST reorder Admin Page
router.post('/reorder', function(req, res) {
    var ids = req.body['id[]'];
    
    sortPages(ids, function() {
        Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else { 
                req.app.locals.pages = pages;
            }
        });
    });
});

// GET edit Admin Page
router.get('/edit/:id', function(req, res) {
    Page.findOne({_id: req.params.id}, function (err, page) {
        if (err) return console.log(err);
        res.render('./admin/edit_admin', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

// POST edit Admin Page
router.post(
    '/edit/:id',
    // username must be an email
    body('title').notEmpty(),
    // password must be at least 5 chars long
    body('content').isLength({ min: 5 }),
    (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./admin/edit_admin', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
        req.session.errors = errors;
    } else {
        Page.findOne({slug: slug, _id:{'$ne': id}}, function(err, page) {
            if (page) {
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                res.render('./admin/edit_admin', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function (err, page) {
                    if (err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err) return console.log(err);

                        Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
                            if (err) {
                                console.log(err);
                            } else { 
                                req.app.locals.pages = pages;
                            }
                        });
                        
                        req.flash('success', 'Page edit!');
                        res.redirect('/admin/edit/' + page.id);
                    });
                });
            }
        });
    }
});

// GET delete Admin Page
router.get('/del/:id', function(req, res) {
    Page.findByIdAndRemove(req.params.id, function (err, page) {
        if (err) return console.log(err);

        Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else { 
                req.app.locals.pages = pages;
            }
        });

        req.session.messages = {"success": "Successfuly page deleted"};
        session.messages = req.session.messages;
        res.redirect('/admin');
    });
});

// Exports
module.exports = router;