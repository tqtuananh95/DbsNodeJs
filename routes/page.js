const express = require('express');
const router = express.Router();

// Models Page
const Page = require('../models/page');

// Get a page
router.get('/', function(req, res) {
    res.render('./_layouts/index', {
        title: 'Home'
    });
});

// Get a page by slug
// router.get('/:slug', function(req, res) {

//     var slug = req.params.slug;

//     Page.findOne({slug: slug}, function (err, page) {
//         if (err) console.log(err);

//         if (!page) {
//             res.redirect('/');
//         } else {
//             res.render('./_layouts/index', {
//                 title: page.title
//             });
//         }
//     })
    
// });
// Exports
module.exports = router;