const mongoose = require('mongoose');

// CategorySchame
const CategorySchame = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }
});

const Category = module.exports = mongoose.model('Category', CategorySchame);
