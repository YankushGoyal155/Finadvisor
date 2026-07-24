(function ($, Drupal, drupalSettings) {
	Drupal.behaviors.tooltip = {
	  attach: function (context) {
		$(document).ready(function(){		
			
			$('#views_slideshow_controls_text_pause_home_page_slider-block_1').attr('data-placement','right');
			$('#views_slideshow_controls_text_pause_home_page_slider-block_1').attr('data-toggle','tooltip');
			$('#views_slideshow_controls_text_pause_home_page_slider-block_1').attr('data-original-title','Pause');
			$('#views_slideshow_controls_text_pause_home_page_slider-block_1').attr('data-title','');
			$('#views_slideshow_controls_text_pause_home_page_slider-block_1').removeAttr('title');
			$("#views_slideshow_controls_text_pause_home_page_slider-block_1").tooltip({
				template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow arr"></div><div class="tooltip-inner large"></div></div>'
			});
			
		});

		//$("#views_slideshow_controls_text_pause_home_page_slider-block_1").tooltip();
	  	$('#views_slideshow_controls_text_pause_home_page_slider-block_1').on('click mouseover',function() {
			let label =  $(this).children().text();
			// let label_2 = $(this).children().attr('aria-label');
			// let title =  $(this).attr('title');
			switch (label)  {
				case "Pause":		
					$(this).attr('data-placement','right');
					$(this).attr('data-toggle','tooltip');
					$(this).attr('data-original-title','Pause');
					$(this).attr('data-title','');
				break;
				case "Resume":
					$(this).attr('data-placement','right');
					$(this).attr('data-toggle','tooltip');
					$(this).attr('data-original-title','Play');
					$(this).attr('data-title','');
				break;
				case "फिर शुरू करना":
					$(this).attr('data-placement','right');
					$(this).attr('data-toggle','tooltip');
					$(this).attr('data-original-title','खेल');
					$(this).attr('data-title','');
				break;
				case "ठहराव":		
					$(this).attr('data-placement','right');
					$(this).attr('data-toggle','tooltip');
					$(this).attr('data-original-title','ठहराव');
					$(this).attr('data-title','');
				break;
				default:
			// $(this).attr('title',label_2);
			//	$(this).attr('data-placement','top');
			//	$(this).attr('data-toggle','tooltip');
			//	$(this).attr('data-original-title',label_2);
			//	$(this).attr('data-title','');
			break;
			}     
		});
		
		
		$('.block-views-blockbrochures-block-1').find('details').append('<summary>Show Older Version</summary>');
		$('.block-views-blockbrochures-block-1').find('details').on('click',function() {
			if ($(this).is('[open]')) {
				$(this).find('summary').html('Show Older Version');
			} else {
				$(this).find('summary').html('Hide Older Version');
			}
		});	

		$("#drupal-modal").on("keydown", function(e) {
				$('p img').parent('p').addClass('displayborder');
				$('#drupal-modal--body li,#drupal-modal--body p').attr('tabindex','0');
				$('.external-link-popup-body p').each(function() {
						var $this = $(this);
    					if($this.html().replace(/\s|&nbsp;/g, '').length == 0 || $this.html().trim().length==0)
        				$this.removeAttr('tabindex');     
    			});
			   if (e.keyCode === 9) {
				  let focusable = e.target.closest('div.modal-dialog').querySelectorAll('input,button,select,textarea,p,a,li');
			  if (focusable.length) {
					   let first = focusable[0];
		   
					   let last = focusable[focusable.length - 1];
					   let shift = e.shiftKey;
					   if (shift) {
						   if (e.target === first) { // shift-tab pressed on first input in dialog
							   last.focus();
							   e.preventDefault();
						   }
					   } else {
						   if (e.target === last) { // tab pressed on last input in dialog
							   first.focus();
							   e.preventDefault();
						   }
					   }
				   }
			   }
		   
		 });
		// jQuery("#drupal-modal--body p").each(function(){
  //       var dot=jQuery(this).html();
  //         if(dot.length<=8){
  //         	jQuery(this).css('display','none');
  //         }
  //   	});

	}
  };
  })(jQuery, Drupal, drupalSettings);