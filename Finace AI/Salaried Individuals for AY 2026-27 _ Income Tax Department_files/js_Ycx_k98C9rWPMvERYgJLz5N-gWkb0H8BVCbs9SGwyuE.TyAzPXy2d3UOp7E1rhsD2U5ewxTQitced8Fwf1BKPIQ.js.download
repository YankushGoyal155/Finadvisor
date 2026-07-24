(function ($, Drupal){
    Drupal.behaviors.videosocial = {
        attach: function (context, settings) {           
		   'use strict';				 
		   
		  //Social share icon for all videos using video.js 
		   $( document ).ready(function() {				
			//console.log($(this));
				$('.mobile-vdo .vjs-tech').once().each(function(){		  
					 	
					//console.log($(this).attr('id'));
					var myPlayer = videojs($(this).attr('id'));		
					//controlBar = myPlayer.$(".vjs-control-bar");
                   
					var share_url = $(this).find('Source:first').attr('src'); 					
					var video = videojs($(this).attr('id'));			  
					var shareOptions = {
							socials: ['fbFeed', 'tw'],
							url: share_url,
							title: 'videojs-share',
							description: 'video.js share plugin',
							image: 'https://dummyimage.com/1200x630',

							// required for Facebook and Messenger
							fbAppId: '213852599690764',
							// optional for Facebook
							redirectUri: window.location.href + '#close',

							// optional for VK
							isVkParse: true
							
							// optinal embed code
							//embedCode : ' <iframe id="frame" src="https://www.youtube.com/watch?v=WDe6jcxZcz8" width="100%" height="300"></iframe>'				 
					}
					video.share(shareOptions);	
					
					/*Transcript button */
				/*	video.getChild('controlBar').addChild('button').addClass('transcript');	

					$(".vjs-button.transcript").click(function() {						
						var myContainers =$(this)
						.parents()
						.find(".views-field-field-transcript-file a")
						.attr("href");
						download(myContainers,"transcript.srt")							
					});	

					*/											 
					
					function download(url, filename) {
						fetch(url).then(function(t) {
							return t.blob().then(function(b){
								var a = document.createElement("a");
								a.href = URL.createObjectURL(b);
								a.setAttribute("download", filename);
								a.click();
							}
							);
						});
					}

					/* Forward Backward Buttons */
					var myPlayer = videojs($(this).attr('id'));				
							
					var jumpAmount = 5,
						controlBar,
						insertBeforeNode,
						newElementBB = document.createElement("button"),
						newElementFB = document.createElement("button"),
						newElementfront = document.createElement("button"),
						newElementend = document.createElement("button"),
						newElementtrans = document.createElement("button"),
						newImageBB = document.createElement("img"),
						newImageFB = document.createElement("img"),
						newImagefront = document.createElement("img"),
						newImageend = document.createElement("img"),
						newImagetrans = document.createElement("img");
						
					// +++ Assign IDs for later element manipulation +++
					newElementBB.id = "backButton";
					newElementFB.id = "forwardButton";
					newElementfront.id = "frnotButton";
					newElementend.id = "endButton";	
					newElementtrans.id = "transcript";					 
					
					newElementBB.setAttribute(
						"class",
						"vjs-play-control vjs-control vjs-button vjs-backward"
					);
					newElementFB.setAttribute(
						"class",
						"vjs-play-control vjs-control vjs-button vjs-forward"
					);
					newElementfront.setAttribute(
						"class",
						"vjs-play-control vjs-control vjs-button vjs-front"
					);
					newElementend.setAttribute(
						"class",
						"vjs-play-control vjs-control vjs-button vjs-back"
					);
					newElementtrans.setAttribute(
						"class",
						"vjs-play-control vjs-control vjs-button vjs-trasnscript"
					);
					newImagetrans.setAttribute(
						"src",
						drupalSettings.path.baseUrl + "themes/custom/itdbase/images/trans.svg"
					);
					newImagetrans.setAttribute(
						"alt",
						"Transscript"
					);
					newElementtrans.appendChild(newImagetrans);

					newImageBB.setAttribute(
						"src",
						drupalSettings.path.baseUrl + "themes/custom/itdbase/images/prev.svg"
					);
					newImageBB.setAttribute(
						"alt",
						"Previous Button"
					);
					newElementBB.appendChild(newImageBB);
					newImageFB.setAttribute(
						"src",
						drupalSettings.path.baseUrl + "themes/custom/itdbase/images/next.svg"
					);
					newImageFB.setAttribute(
						"alt",
						"Next Button"
					);
					newElementFB.appendChild(newImageFB);
				
					newImagefront.setAttribute(
						"src",
						drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-front.svg"
					);
					newImagefront.setAttribute(
						"alt",
						"Front Button"
					);
					newElementfront.appendChild(newImagefront);
				
					newImageend.setAttribute(
						"src",
						drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-end.svg"
					);
					newImageend.setAttribute(
						"alt",
						"End Button"
					);
					newElementend.appendChild(newImageend);					
					
						
					// +++ Get controlbar and insert elements +++
					controlBar = myPlayer.$(".vjs-control-bar");
					// Get the element to insert buttons in front of in conrolbar
					insertBeforeNode = myPlayer.$(".vjs-volume-panel");
					var insertBeforeNodeshare = myPlayer.$(".vjs-descriptions-button");
					var insertBeforeNodetime = myPlayer.$(".vjs-remaining-time");
					if ($(this).parents().find(".video-transcript-link-mobile a").attr("href")) 
					{
						controlBar.insertBefore(newElementtrans, insertBeforeNodeshare);
					}else{

					}
					
					// Insert the button div in proper location
					controlBar.insertBefore(newElementfront, insertBeforeNode);
					controlBar.insertBefore(newElementBB, insertBeforeNode);
					controlBar.insertBefore(newElementFB, insertBeforeNode);					
					controlBar.insertBefore(newElementend, insertBeforeNode);					
					controlBar.insertBefore(insertBeforeNodetime, insertBeforeNode);				  
							
					// Back button logic, don't jump to negative times
					newElementBB.addEventListener("click", function() {
						var newTime,
						rewindAmt = jumpAmount,
						videoTime = myPlayer.currentTime();
						if (videoTime >= rewindAmt) {
						newTime = videoTime - rewindAmt;
						} else {
						newTime = 0;
						}
						myPlayer.currentTime(newTime);
					});					
						
					// Forward button logic, don't jump past the duration
					newElementFB.addEventListener("click", function() {
						var newTime,
						forwardAmt = jumpAmount,
						videoTime = myPlayer.currentTime(),
						videoDuration = myPlayer.duration();
						if (videoTime + forwardAmt <= videoDuration) {
						newTime = videoTime + forwardAmt;
						} else {
						newTime = videoDuration;
						}
						myPlayer.currentTime(newTime);
					});					
						
					newElementfront.addEventListener("click", function() {
						var newTime=0;				
						myPlayer.currentTime(newTime);
						});
				
					newElementend.addEventListener("click", function() {
						var videoDuration = myPlayer.duration();
						myPlayer.currentTime(videoDuration);
					});

					newElementtrans.addEventListener("click", function() {
						var myContainers =$(this)
						.parents()
						.find(".video-transcript-link-mobile a")
						.attr("href");
						download(myContainers,"transcript.srt")	
					});	

				});	
				$('.desktop-vdo .vjs-tech').once().each(function(){		  
					
				console.log($(this).attr('id'));
				var myPlayer = videojs($(this).attr('id'));		
				//controlBar = myPlayer.$(".vjs-control-bar");

				var share_url = $(this).find('Source:first').attr('src'); 					
				var video = videojs($(this).attr('id'));			  
				var shareOptions = {
						socials: ['fbFeed', 'tw'],
						url: share_url,
						title: 'videojs-share',
						description: 'video.js share plugin',
						image: 'https://dummyimage.com/1200x630',

						// required for Facebook and Messenger
						fbAppId: '213852599690764',
						// optional for Facebook
						redirectUri: window.location.href + '#close',

						// optional for VK
						isVkParse: true
						
						// optinal embed code
						//embedCode : ' <iframe id="frame" src="https://www.youtube.com/watch?v=WDe6jcxZcz8" width="100%" height="300"></iframe>'				 
				}
				video.share(shareOptions);	
				
				/*Transcript button */
			/*	video.getChild('controlBar').addChild('button').addClass('transcript');	

				$(".vjs-button.transcript").click(function() {						
					var myContainers =$(this)
					.parents()
					.find(".views-field-field-transcript-file a")
					.attr("href");
					download(myContainers,"transcript.srt")							
				});	

				*/											 
				
				function download(url, filename) {
					fetch(url).then(function(t) {
						return t.blob().then(function(b){
							var a = document.createElement("a");
							a.href = URL.createObjectURL(b);
							a.setAttribute("download", filename);
							a.click();
						}
						);
					});
				}

				/* Forward Backward Buttons */
				var myPlayer = videojs($(this).attr('id'));				
						
				var jumpAmount = 5,
					controlBar,
					insertBeforeNode,
					newElementBB = document.createElement("button"),
					newElementFB = document.createElement("button"),
					newElementfront = document.createElement("button"),
					newElementend = document.createElement("button"),
					newElementtrans = document.createElement("button"),
					newImageBB = document.createElement("img"),
					newImageFB = document.createElement("img"),
					newImagefront = document.createElement("img"),
					newImageend = document.createElement("img"),
					newImagetrans = document.createElement("img");
					  
				// +++ Assign IDs for later element manipulation +++
				newElementBB.id = "backButton";
				newElementFB.id = "forwardButton";
				newElementfront.id = "frnotButton";
				newElementend.id = "endButton";	
				newElementtrans.id = "transcript";	

				newElementBB.setAttribute(
					"class",
					"vjs-play-control vjs-control vjs-button vjs-backward"
				);
				newElementFB.setAttribute(
					"class",
					"vjs-play-control vjs-control vjs-button vjs-forward"
				);
				newElementfront.setAttribute(
					"class",
					"vjs-play-control vjs-control vjs-button vjs-front"
				);
				newElementend.setAttribute(
					"class",
					"vjs-play-control vjs-control vjs-button vjs-back"
				);
				newElementtrans.setAttribute(
					"class",
					"vjs-play-control vjs-control vjs-button vjs-trasnscript"
				);
				newImagetrans.setAttribute(
					"src",
					drupalSettings.path.baseUrl + "themes/custom/itdbase/images/trans.svg"
				);
				newImagetrans.setAttribute(
					"alt",
					"Transcript Button"
				);
				newElementtrans.appendChild(newImagetrans);

				newImageBB.setAttribute(
					"src",
					drupalSettings.path.baseUrl + "themes/custom/itdbase/images/prev.svg"
				);
				newImageBB.setAttribute(
					"alt",
					"Previous Button"
				);
				newElementBB.appendChild(newImageBB);
				newImageFB.setAttribute(
					"src",
					drupalSettings.path.baseUrl + "themes/custom/itdbase/images/next.svg"
				);
				newImageFB.setAttribute(
					"alt",
					"Next Button"
				);
				newElementFB.appendChild(newImageFB);
			
				newImagefront.setAttribute(
					"src",
					drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-front.svg"
				);
				newImagefront.setAttribute(
					"alt",
					"Front Button"
				);
				newElementfront.appendChild(newImagefront);
			
				newImageend.setAttribute(
					"src",
					drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-end.svg"
				);
				newImageend.setAttribute(
					"alt",
					"End Button"
				);
				newElementend.appendChild(newImageend);	

			
				// +++ Get controlbar and insert elements +++
				controlBar = myPlayer.$(".vjs-control-bar");
				// Get the element to insert buttons in front of in conrolbar
				insertBeforeNode = myPlayer.$(".vjs-volume-panel");
				var insertBeforeNodeshare = myPlayer.$(".vjs-descriptions-button");
				var insertBeforeNodetime = myPlayer.$(".vjs-remaining-time");
				if ($(this).parents().find(".views-field-field-transcript-file a").attr("href")) 
				{
					controlBar.insertBefore(newElementtrans, insertBeforeNodeshare);
				}else{

				}
				
				// Insert the button div in proper location
				controlBar.insertBefore(newElementfront, insertBeforeNode);
				controlBar.insertBefore(newElementBB, insertBeforeNode);
				controlBar.insertBefore(newElementFB, insertBeforeNode);					
				controlBar.insertBefore(newElementend, insertBeforeNode);					
				controlBar.insertBefore(insertBeforeNodetime, insertBeforeNode);				  
						
				// Back button logic, don't jump to negative times
				newElementBB.addEventListener("click", function() {
					var newTime,
					rewindAmt = jumpAmount,
					videoTime = myPlayer.currentTime();
					if (videoTime >= rewindAmt) {
					newTime = videoTime - rewindAmt;
					} else {
					newTime = 0;
					}
					myPlayer.currentTime(newTime);
				});					
					  
				// Forward button logic, don't jump past the duration
				newElementFB.addEventListener("click", function() {
					var newTime,
					forwardAmt = jumpAmount,
					videoTime = myPlayer.currentTime(),
					videoDuration = myPlayer.duration();
					if (videoTime + forwardAmt <= videoDuration) {
					newTime = videoTime + forwardAmt;
					} else {
					newTime = videoDuration;
					}
					myPlayer.currentTime(newTime);
				});					
					
				newElementfront.addEventListener("click", function() {
					var newTime=0;				
					myPlayer.currentTime(newTime);
					});
			
				newElementend.addEventListener("click", function() {
					var videoDuration = myPlayer.duration();
					myPlayer.currentTime(videoDuration);
				});

				newElementtrans.addEventListener("click", function() {
					var myContainers =$(this)
					.parents()
					.find(".views-field-field-transcript-file a")
					.attr("href");
					download(myContainers,"transcript.srt")	
				});	

				});		
				
				$('.video-js').once().each(function(){	
					
					$(this).find("ul.vjs-menu-content").removeAttr("role");
					$(this).find("#backButton img").attr("alt","backButton");
					$(this).find("#forwardButton img").attr("alt","forwardButton");
					$(this).find("#frnotButton img").attr("alt","frnotButton");
					$(this).find("#endButton img").attr("alt","endButton");	
					$(this).find("#transcript img").attr("alt","transcript");
				});
				$('.vjs-menu-content').removeAttr('role');
				let i = 1;
				$('.vjs-label').once().each(function(){	
					let attr_id = $(this).attr('id') + '_new_' + i;
					$(this).attr('for',attr_id);
					$(this).next().attr('id',attr_id);
					i++;
				});

				
				

			});	
	
			
        }      
    };
})(jQuery, Drupal);



jQuery(document).on("opened", ".remodal", function() {
		
	var video = videojs(jQuery(this).find('video').attr('id'));		
	//console.log('open');
	video.pause();	
	
	var share_url = jQuery(this).find('video Source:first').attr('src'); 			
	  
	var shareOptions = {
		socials: ['fbFeed', 'tw'],
		url: share_url,
		title: 'videojs-share',
		description: 'video.js share plugin',
		image: 'https://dummyimage.com/1200x630',

		// required for Facebook and Messenger
		fbAppId: '213852599690764',
		// optional for Facebook
		redirectUri: window.location.href + '#close',

		// optional for VK
		isVkParse: true						 
	}
	video.share(shareOptions);

	/*if (!video.getChild('controlBar').getChild('button') && jQuery(this).find('.video-transcript-link a').attr("href")) 
	{
		video.getChild('controlBar').addChild('button').addClass('transcript');	
		jQuery(this).on('click','.vjs-button.transcript',function() {
			var myContainers =jQuery(this).parent().parent().parent().find('.video-transcript-link a').attr("href");
			download1(myContainers,"transcript.srt")							
		});	
	}	*/
	
			
		function download1(url, filename) {
			fetch(url).then(function(t) {
				return t.blob().then(function(b){
					var a = document.createElement("a");
					a.href = URL.createObjectURL(b);
					a.setAttribute("download", filename);
					a.click();
				}
				);
			});
		}
	

	var myPlayer = videojs(jQuery(this).find('video').attr('id'));
	
	var jumpAmount = 5,
	controlBar,
	insertBeforeNode,
	newElementBB = document.createElement("button"),
	newElementFB = document.createElement("button"),
	newElementfront = document.createElement("button"),
	newElementend = document.createElement("button"),
	newElementtrans = document.createElement("button"),
	newImageBB = document.createElement("img"),
	newImageFB = document.createElement("img"),
	newImagefront = document.createElement("img"),
	newImageend = document.createElement("img"),
	newImagetrans = document.createElement("img");	
					  
	// +++ Assign IDs for later element manipulation +++
	newElementBB.id = "backButton";
	newElementFB.id = "forwardButton";
	newElementfront.id = "frnotButton";
	newElementend.id = "endButton";		
	newElementtrans.id = "transcript";	
	newElementBB.setAttribute(
		"class",
		"vjs-play-control vjs-control vjs-button vjs-backward"
	);
	newElementFB.setAttribute(
		"class",
		"vjs-play-control vjs-control vjs-button vjs-forward"
	);
	newElementfront.setAttribute(
		"class",
		"vjs-play-control vjs-control vjs-button vjs-front"
	);
	newElementend.setAttribute(
		"class",
		"vjs-play-control vjs-control vjs-button vjs-back"
	);
	newElementtrans.setAttribute(
		"class",
		"vjs-play-control vjs-control vjs-button vjs-trasnscript"
	);
	newImagetrans.setAttribute(
		"src",
		drupalSettings.path.baseUrl + "themes/custom/itdbase/images/trans.svg"
	);
	newImagetrans.setAttribute(
		"alt",
		"Transscript Button"
	);
	newElementtrans.appendChild(newImagetrans);	
	newImageBB.setAttribute(
		"src",
		drupalSettings.path.baseUrl + "themes/custom/itdbase/images/prev.svg"
	);
	newImageBB.setAttribute(
		"alt",
		"Previous Button"
	);
	newElementBB.appendChild(newImageBB);
	newImageFB.setAttribute(
		"src",
		drupalSettings.path.baseUrl + "themes/custom/itdbase/images/next.svg"
	);
	newImageFB.setAttribute(
		"alt",
		"Next Button"
	);
	newElementFB.appendChild(newImageFB);

	newImagefront.setAttribute(
		"src",
		drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-front.svg"
	);
	newImagefront.setAttribute(
		"alt",
		"Front Button"
	);
	newElementfront.appendChild(newImagefront);

	newImageend.setAttribute(
		"src",
		drupalSettings.path.baseUrl + "themes/custom/itdbase/images/v-end.svg"
	);
	newImageend.setAttribute(
		"alt",
		"End Button"
	);
	newElementend.appendChild(newImageend);			
	
	jQuery(this).find("#backButton img").attr("alt","backButton");
	jQuery(this).find("#forwardButton img").attr("alt","forwardButton");
	jQuery(this).find("#frnotButton img").attr("alt","frnotButton");
	jQuery(this).find("#endButton img").attr("alt","endButton");	
	jQuery(this).find("#transcript img").attr("alt","transcript");
	jQuery('.vjs-menu-content').removeAttr('role');
	let i = 1;
	jQuery('.vjs-label').once().each(function(){	
		let attr_id = jQuery(this).attr('id') + '_new_' + i;
		jQuery(this).attr('for',attr_id);
		jQuery(this).next().attr('id',attr_id);
		i++;
	});
	// +++ Get controlbar and insert elements +++
	controlBar = myPlayer.$(".vjs-control-bar");
	// Get the element to insert buttons in front of in conrolbar
	insertBeforeNode = myPlayer.$(".vjs-volume-panel");	
	var insertBeforeNodeshare = myPlayer.$(".vjs-chapters-button");
	var insertBeforeNodetime = myPlayer.$(".vjs-remaining-time");

	if (jQuery(this).find('.video-transcript-link a').attr("href")) 
	{
		controlBar.insertBefore(newElementtrans, insertBeforeNodeshare);
	}else{

	}
	
	if (myPlayer.$("#backButton") && myPlayer.$("#forwardButton") && myPlayer.$("#frnotButton") && myPlayer.$("#endButton")) {
	}
	else {
		controlBar.insertBefore(newElementfront, insertBeforeNode);
		controlBar.insertBefore(newElementBB, insertBeforeNode);
		controlBar.insertBefore(newElementFB, insertBeforeNode);
		controlBar.insertBefore(newElementend, insertBeforeNode);	
		controlBar.insertBefore(insertBeforeNodetime, insertBeforeNode);
	}					

	// Back button logic, don't jump to negative times
	newElementBB.addEventListener("click", function() {
		var newTime,
		rewindAmt = jumpAmount,
		videoTime = myPlayer.currentTime();
		if (videoTime >= rewindAmt) {
		newTime = videoTime - rewindAmt;
		} else {
		newTime = 0;
		}
		myPlayer.currentTime(newTime);
	});					
				
	// Forward button logic, don't jump past the duration
	newElementFB.addEventListener("click", function() {
		var newTime,
		forwardAmt = jumpAmount,
		videoTime = myPlayer.currentTime(),
		videoDuration = myPlayer.duration();
		if (videoTime + forwardAmt <= videoDuration) {
		newTime = videoTime + forwardAmt;
		} else {
		newTime = videoDuration;
		}
		myPlayer.currentTime(newTime);
	});	
					
	newElementfront.addEventListener("click", function() {
		var newTime=0;				
		myPlayer.currentTime(newTime);
		});

	newElementend.addEventListener("click", function() {
		var videoDuration = myPlayer.duration();
		myPlayer.currentTime(videoDuration);
	});

	newElementtrans.addEventListener("click", function() {
	//if (jQuery(this).find('.video-transcript-link a').attr("href")) 
	//{
		var myContainers =jQuery(this).parent().parent().parent().find('.video-transcript-link a').attr("href");
		download1(myContainers,"transcript.srt")		
//	}		
	});	
	 
});
	
jQuery(document).on("closing", ".remodal", function(e) {
	
	var video = videojs(jQuery(this).find('video').attr('id'));
	video.load();
	jQuery(this).find('#transcript').remove();
	//console.log("Modal is close");
	// jQuery(this).find('video').remove();
	
	//video.play("pause");
	//video.muted(true); // nmute the volume
	
});

jQuery( document ).ready(function() {
	
	jQuery('#cboxPrevious').attr('aria-label','cboxPrevious');
	jQuery('#cboxSlideshow').attr('aria-label','cboxSlideshow');
	jQuery('#cboxNext').attr('aria-label','cboxNext');
	jQuery('.block-views-blockall-taxonomy-terms-of-user-manual-block-1 .field-content nav').removeAttr("aria-labelledby");
	jQuery('.block-views-blockall-taxonomy-terms-of-user-manual-block-2 .field-content nav').removeAttr("aria-labelledby");

	jQuery('#maincontainer a').once().each(function(i){	
		var tit  =	jQuery(this).attr('title');
		jQuery(this).attr('data-title',tit);
		jQuery(this).removeAttr('title');
	});
}); 


