const express = require('express');
const session = require('express-session');
const router = express.Router();
const { body, validationResult, check} = require('express-validator');

const Category = require('../models/category');

// Category Page
router.get('/', function(req, res) {
    Category.find(function(err, categories) {
        if (err) return console.log(err);
        res.render('./category/category_page', {
            categories: categories,
            message: session.messages,
            title: "Category Page"
        });
        session.messages = "";
    });
});

// Add Category Page
router.get('/add', function(req, res) {
    console.log(req.body);
    const title = req.body.title;
    const slug = req.body.slug;

    res.render('./category/add_category', {
        title: title,
        slug: slug,
        errors: req.session.errors,
        message: session.messages,
    });
    req.session.errors = null;
    session.messages = "";
});

// POST add Admin Page
router.post(
    '/add',
    // username must be an email
    body('title').notEmpty(),
    (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./category/add_category', {
            errors: errors.array(),
            title: title,
            slug: slug,
        });
        req.session.errors = errors;
    } else {
        Category.findOne({slug: slug}, function(err, category) {
            if (category) {
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                req.session.messages = {"type": "alert alert-danger","success": "Page slug exists, choose another."};
                session.messages = req.session.messages;
                res.redirect('/category/add');
            } else {
                const category = new Category({
                    title: title,
                    slug: slug,
                });
                category.save(function(err) {
                    if (err) return console.log(err);//commonjs.openSnack('Page added!', 3, 'SUCCESS');
                    
                    Category.find(function(err, categories) {
                        if (err) {
                            console.log(err);
                        } else { 
                            app.locals.categories = categories;
                        }
                    });
                    
                    req.session.messages = {"type": "alert alert-success", "success": "Successfuly page added"};
                    session.messages = req.session.messages;
                    res.redirect('/category');
                });
            }
        });
    }
    
});

// GET edit Admin Page
router.get('/edit/:id', function(req, res) {
    Category.findById({_id: req.params.id}, function (err, category) {
        if (err) return console.log(err);
        res.render('./category/edit_category', {
            title: category.title,
            slug: category.slug,
            id: category._id,
            message: session.messages
        });
    });
});

// POST edit Category Page
router.post(
    '/edit/:id',
    // username must be an email
    body('title').notEmpty(),
    (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    const id = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./category/edit_category', {
            errors: errors.array(),
            title: title,
            slug: slug,
            id: id
        });
        req.session.errors = errors;
    } else {
        Category.findOne({slug: slug, _id:{'$ne': id}}, function(err, category) {
            if (category) {
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                req.session.messages = {"type": "alert alert-danger","success": "Category slug exists, choose another."};
                res.render('./category/edit_category', {
                    title: title,
                    slug: slug,
                    id: id,
                    message: req.session.messages
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err) return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err) return console.log(err);

                        Category.find(function(err, categories) {
                            if (err) {
                                console.log(err);
                            } else { 
                                app.locals.categories = categories;
                            }
                        });

                        req.session.messages = {"type": "alert alert-success","success": "Successfuly category edited!"};
                        session.messages = req.session.messages;
                        res.redirect('/category');
                    });
                });
            }
        });
    }
});

// GET delete Admin Page
router.get('/del/:id', function(req, res) {
    Category.findByIdAndRemove(req.params.id, function (err, page) {
        if (err) return console.log(err);
        req.session.messages = {"type": "alert alert-success","success": "Successfuly category deleted!"};
        session.messages = req.session.messages;
        res.redirect('/category');
    });
});

// Exports
module.exports = router;