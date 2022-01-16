$(function() {
    if ($('textarea#ckedit_text').length) {
        CKEDITOR.replace('ckedit_text');
    }

    $('a.alink').on('click', function() {
        if (!confirm('Confirm deletion ?')) 
            return false;
    });

    $('a.alinkclear').on('click', function() {
        if (!confirm('Confirm clear cart?')) 
            return false;
    });
});