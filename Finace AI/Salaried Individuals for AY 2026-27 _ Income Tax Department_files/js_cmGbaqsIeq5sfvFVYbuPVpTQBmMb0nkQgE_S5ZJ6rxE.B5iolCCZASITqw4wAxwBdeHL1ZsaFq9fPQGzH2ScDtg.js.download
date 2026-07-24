(function ($, Drupal, drupalSettings) {
	Drupal.behaviors.aboutus = {
		attach: function (context) {

			//$( "#accordion" ).accordion();

			//Option Page - Changing the Text Size
			/* $(".chTxtSize").click(function(e){
				$(".chTxtCnt").slideToggle('slow');
				e.stopPropagation();
			 }); */
			 
			//  jQuery('body').on('chosen:ready', function(evt, params) {
				jQuery('.js-form-item.js-form-type-select', context).each(function(index, element) {
				  jQuery(this).find('.chosen-container-single input.chosen-search-input').attr('aria-label', jQuery.trim(jQuery(this).find('label').text()));
				});
			//   });
	}
};
})(jQuery, Drupal, drupalSettings);