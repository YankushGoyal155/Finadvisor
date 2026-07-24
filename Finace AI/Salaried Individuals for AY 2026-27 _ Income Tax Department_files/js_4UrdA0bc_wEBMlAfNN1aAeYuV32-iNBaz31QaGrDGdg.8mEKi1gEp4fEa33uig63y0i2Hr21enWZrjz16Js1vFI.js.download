(function($, Drupal, drupalSettings) {
    "use strict";
    Drupal.behaviors.itdprint = {
        attach: function(context, settings) {
                var options = {
                    debug: false,
                    doctypeString: '<!DOCTYPE html>',
                    loadCSS: location.origin+drupalSettings.path.baseUrl+"/themes/custom/itdbase/css/base.css",
                    header: '<h1><img src='+location.origin+drupalSettings.path.baseUrl+'/themes/custom/itdbase/logo.svg></h1><h2>'+drupalSettings.currentPageTitle+'</h2>',
                    footer: null
                    };
                    $('#itd_print_btn').click(function(){
                        $('.itd_print_block_data').printThis(options);
                    });
                }
             };
})(jQuery, Drupal, drupalSettings);