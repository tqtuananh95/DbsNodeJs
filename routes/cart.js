const express = require('express');
const session = require('express-session');
const router = express.Router();

// Models Page
const Product = require('../models/product');

// Get add Cart page
router.get('/add/:product', function(req, res) {
    
    var slug = req.params.product;

    Product.findOne({slug: slug}, function(err, p) {
        if (err) console.log(err);

        if (typeof session.cart == "undefined") {
            session.cart = [];
            session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_image/' + p._id + '/' + p.image
            });
        } else {
            var newItem = true;
            
            for (let i = 0; i < session.cart.length; i++) {
                if (session.cart[i].title == slug) {
                    session.cart[i].qty++
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                session.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_image/' + p._id + '/' + p.image
                });
            }
        }

        session.messages = {"type": "alert alert-success","success": "Product added to cart!"};
        res.redirect('back');
    });
});

// GET checkout page
router.get('/checkout', function(req, res) {
    if (session.cart && session.cart.length == 0) {
        delete session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('./_layouts/checkout', {
            title: 'Checkout Page',
            cart: session.cart
        });
    }
});

// GET update product page
router.get('/checkout/:product', function(req, res) {
    
    var slug = req.params.product;
    var cart = session.cart;
    var action = req.query.action;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete session.cart;
                    break;
                default:
                    console.log('Update problem');
                    break;
            }
            break;
        }
        
    }
    session.messages = {"type": "alert alert-success","success": "Update cart!"};
    res.redirect('/cart/checkout');
});

// GET clear page
router.get('/clear', function(req, res) {
    delete session.cart;
    session.messages = {"type": "alert alert-success","success": "Cart cleared!"};
    res.redirect('/cart/checkout');
});

// Exports
module.exports = router;