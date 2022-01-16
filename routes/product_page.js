const express = require('express');
const session = require('express-session');
const router = express.Router();
const { body, validationResult, check} = require('express-validator');
const mkdir = require('mkdirp');
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
    var count;
    Product.count(function(err, c) {
        count = c;
    });
    Product.find(function(err, products) {
        if (err) return console.log(err);
        res.render('./product/product_page', {
            products: products,
            message: session.messages,
            title: "Product Page",
            count: count
        });
        session.messages = "";
    });
});

// Add Product Page
router.get('/add', function(req, res) {
    const title = req.body.title;
    const desc = req.body.desc;
    const price = req.body.price;

    Category.find(function (err, categories) {
        res.render('./product/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price,
            errors: req.session.errors,
            message: session.messages,
        });
    });
    
    req.session.errors = null;
    session.messages = "";
});

function isImage(filename) {
    var extension = (path.extname(filename)).toLowerCase();
    switch(extension) {
        case '.jpg':
            return '.jpg';
        case '.jpeg':
            return '.jpeg';
        case '.png':
            return '.png';
        default:
            return false;
    }
}
// POST add Product Page
router.post(
    '/add',
    body('title', 'Title must have a value.').notEmpty(),
    body('desc', 'Description must have a value.').notEmpty(),
    body('price', 'Price must have a value.').isDecimal(),
    (req, res) => {
    
    var imageFile = typeof req.files.image !== "" ? req.files.image.name : "";
    if(!isImage(imageFile)) {
        session.messages = {"type": "alert alert-danger","success": "Image must have a value."};
    }
    
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();;
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        Category.find(function(err, categories) {
            if (err) return console.log(err);
            res.render('./product/add_product', {
                errors: errors.array(),
                title: title,
                categories: categories,
                desc: desc,
                price: price,
                message: session.messages,
            });
        });
    } else {
        Product.findOne({slug: slug}, function(err, product) {
            if (product) {
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                req.session.messages = {"type": "alert alert-danger","success": "Page slug exists, choose another."};
                session.messages = req.session.messages;
                Category.find(function(err, categories) {
                    if (err) return console.log(err);
                    res.render('./product/add_product', {
                        title: title,
                        categories: categories,
                        desc: desc,
                        price: price,
                        message: session.messages,
                    });
                });
            } else {
                const price2 =  parseFloat(price).toFixed(2);

                const product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function(err) {
                    if (err) return console.log(err);//commonjs.openSnack('Page added!', 3, 'SUCCESS');
                    fs.mkdirSync('public/product_image/' + product._id, function(err) {
                        return console.log(err);
                    });
                    fs.mkdirSync('public/product_image/' + product._id + '/gallery', function(err) {
                        return console.log(err);
                    });
                    fs.mkdirSync('public/product_image/' + product._id + '/gallery/thumbs', function(err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_image/' + product._id + '/' + imageFile;
                        console.log(productImage);
                        productImage.mv(path, function(err) {
                            return console.log(err);
                        });
                    }
                    req.session.messages = {"type": "alert alert-success", "success": "Successfuly page added"};
                    session.messages = req.session.messages;
                    res.redirect('/product');
                });
            }
        });
    }
});

// GET edit product Page
router.get('/edit/:id', function(req, res) {
    var errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function(err, p) {
            if (err) {
                console.log(err);
                res.redirect('/product');
            } else {
                var galleryDir = 'public/product_image/' + p.id + '/gallery';
                var galleryImage = null;

                fs.readdir(galleryDir, function(err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImage = files;

                        res.render('./product/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImage: galleryImage,
                            id: p._id,
                            message: session.messages
                        });
                    }
                })
            }
        });
    });
});

// POST edit product Page
router.post(
    '/edit/:id',
    body('title', 'Title must have a value.').notEmpty(),
    body('desc', 'Description must have a value.').notEmpty(),
    body('price', 'Price must have a value.').isDecimal(),
    (req, res) => {
    
    var imageFile = "";
    if (req.files !== null) {
        imageFile = typeof req.files.image !== "" ? req.files.image.name : "";
        if(!isImage(imageFile)) {
            session.messages = {"type": "alert alert-danger","success": "Image must have a value."};
        }
    }
    
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const id = req.params.id;
    
    const errors = validationResult(req);
    if (!errors.isEmpty() || session.messages != undefined) {
        req.session.errors = errors;
        res.redirect('/product/edit/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function(err, product) {
            if (err) console.log(err);
            
            if (product) {
                //commonjs.openSnack('Page slug exists, choose another.', 3, 'SUCCESS');
                req.session.messages = {"type": "alert alert-danger","success": "Product title exists, choose another."};
                session.messages = req.session.messages;
                res.redirect('/product/edit/' + id);
            } else {
                Product.findById(id, function(err, p) {
                    if (err) console.log(err);
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (category != "") {
                        p.image = imageFile;
                    }
                    if (imageFile === "") {
                        p.image = pimage;
                    }

                    p.save(function(err) {
                        if (err) console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_image/' + id + '/' + pimage, function(err) {
                                    if (err) console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_image/' + id + '/' + imageFile; 
                            productImage.mv(path, function(err) {
                                return console.log(err);
                            });
                        }

                        req.session.messages = {"type": "alert alert-success", "success": "Successfuly product edited"};
                        session.messages = req.session.messages;
                        res.redirect('/product/edit/' +id);
                    });
                })
            }
        });
    }
});

// POST product Page
router.post('/gallery/:id', function(req, res) {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_image/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_image/' + id + '/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, function(err) {
        if (err) console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });
    res.redirect('/product/edit/' + id);
});

// GET delete product Page
router.get('/del-image/:image', function(req, res) {
    var originalImage = 'public/product_image/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_image/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    
    fs.remove(originalImage, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.session.messages = {"type": "alert alert-success", "success": "Image deleted!"};
                    session.messages = req.session.messages;
                    res.redirect('/product/edit/' + req.query.id);
                }
            });
        }
    })
});


// GET delete product Page
router.get('/del/:id', function(req, res) {
    Product.findByIdAndRemove(req.params.id, function (err, page) {
        if (err) return console.log(err);
        req.session.messages = {"type": "alert alert-success","success": "Successfuly product deleted!"};
        session.messages = req.session.messages;
        res.redirect('/product');
    });
});

// Exports
module.exports = router;