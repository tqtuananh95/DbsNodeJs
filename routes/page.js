const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('./_layouts/index', {
        title: 'Home'
    });
});
// Exports
module.exports = router;