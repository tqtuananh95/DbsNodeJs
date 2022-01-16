const express = require('express');
const session = require('express-session');
const router = express.Router();
const { body, validationResult, check} = require('express-validator');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');
const path = require('path');
const category = require('../models/category');

// Product Page
router.get('/', function(req, res) {
    Product.find(function(err, products) {
        if (err) return console.log(err);
        res.render('./_layouts/all_product', {
            title: "All Product Page",
            products: products,
        });
        session.messages = "";
    });
});

// Product Page by category
router.get('/:category', function(req, res) {
    var categorySlug = req.params.category;
    Category.findOne({slug: categorySlug}, function (err, cat) {
        Product.find({category: categorySlug}, function(err, products) {
            if (err) return console.log(err);
            res.render('./_layouts/cat_product', {
                title: cat.title,
                products: products,
            });
            session.messages = "";
        });
    });
});

// GET Product details
router.get('/:category/:product', function(req, res) {
    var galleryImages = null;
    Product.findOne({slug: req.params.product}, function(err, product) {
        if (err) { 
            console.log(err);
        } else {
            var galleryDir = 'public/product_image/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('./_layouts/product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                    session.messages = "";
                }
            });
        }
    });
});

// Exports
module.exports = router;