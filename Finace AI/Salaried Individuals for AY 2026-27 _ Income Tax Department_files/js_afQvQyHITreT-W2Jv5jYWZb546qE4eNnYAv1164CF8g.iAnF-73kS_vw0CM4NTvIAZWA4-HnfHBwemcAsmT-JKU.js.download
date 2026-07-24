(function ($) {
	$(document).ready(function () {

		jQuery('.searchclose').hide();
		
		//This is for specific token loading
		    jQuery(document).ajaxComplete(function() {
        var pathname = window.location.pathname.split("/")[3];

        if (pathname == 'user_manual' || pathname == 'faqs' && pathname != undefined)
        {
            var idArray = new Array();
            jQuery('.token-tree tbody .token-group.odd.branch.collapsed').each(function(){
                idArray.push(jQuery(this).prop('id'));
            });
            jQuery('.token-tree tbody .token-group.even.branch.collapsed').each(function(){
                idArray.push(jQuery(this).prop('id'));
            });

            if(jQuery.inArray("token-site", idArray) !== -1) {
             jQuery.each(idArray, function(key,value){
                     id = '#'+ value;
                     if (id != '#token-site') {
                        jQuery(id).css("display", "none");
                     }
                })
            }
        }
    });
		//for tabs
		$(document).delegate('.tabs-list li a', 'click', function (e) {
			e.preventDefault();
		});

		$(document).delegate('.tabs-list li', 'click', function () {

			$(".tabs-list li").removeClass("active");
			$(this).addClass("active"); //  adding active class to clicked tab

		});

		//make empty search input
		$(document).delegate('.searchclose', 'click', function () {
			$('.sr-usr-name').val("");
			$(this).hide();
		});

		var lastSearchRequest;
		//get current path
		var current_path = location.pathname.slice(drupalSettings.path.baseUrl.length + drupalSettings.path.pathPrefix.length);

		if (current_path == "search" || current_path == "help/search") {
								 
            var previous_path = '#';

            var referrer = document.referrer;

            if (referrer) {
              try {
               var refUrl = new URL(referrer);

               if (refUrl.protocol === 'http:' || refUrl.protocol === 'https:') {

                if (refUrl.origin === window.location.origin) {
               previous_path = refUrl.href;
                }
               }
              } catch (e) {
                previous_path = '#';
              }
            } 

          $('img.desktop-search, img.mobile-search').each(function () {
           $('<a>', {
             href: previous_path
            }).insertBefore(this).append(this);
          });



			//when page refresh
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}

			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
				$('.sr-usr-name').val(keyword);
				if (keyword.length && keyword.length > 0) {
					$('.searchclose').show();
				}
				else {
					$('.searchclose').hide();
				}
			}

			var pushstate = {};
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			pushstate['keyword'] = keyword;
			var tab = "all";
			if (getUrlParameter(location.search, 'tab') || current_path == "help/search") {
				tab = "help";
			}
			else if (current_path == "search") {

				tab = "allhelp";

		  	}
			pushstate['facet'] = tab;
			url = Drupal.url("search/search-autocomplete");
			searchMenuTarget = $('.sr-usr-name').closest('.search').find(".search-menutap");
			searchTarget = $('.sr-usr-name').closest('.search').find(".search-results");
			searchMenuTarget.html('');
			searchTarget.html('');

			var results = $.ajax({
				url: url,
				type: 'GET',
				data: pushstate,
				success: function (response) {

					searchMenuTarget.html(response.data1);
					if (getUrlParameter(location.search, 'tab')) {
						$('li.helpmenu').addClass('active');
						$('li.allmenu').removeClass("active");
					}

					searchTarget.html(DOMPurify.sanitize(response.data));
                    // $('.searchnumber').html(+response.search_count + "&nbsp;results");
                    $('.searchnumber').html(DOMPurify.sanitize(response.help_count + "&nbsp;results"));
                    $('.help_count').html(DOMPurify.sanitize("(" + response.help_count + ")"));
			    	// $('.news_count').html("(" + response.news_count + ")");
                    $('.usermanual_count').html(DOMPurify.sanitize("(" + response.usermanual_count + ")"));
					$('.services_count').html(DOMPurify.sanitize("(" + response.services_count + ")"));
                    $('.faq_count').html(DOMPurify.sanitize("(" + response.faq_count + ")"));
                    $('.files_count').html(DOMPurify.sanitize("(" + response.files_count + ")"));
                    $('.helpfiles_count').html(DOMPurify.sanitize("(" + response.helpfiles_count + ")"));
                    $('.all_count').html(DOMPurify.sanitize("(" + response.allcount + ")"));

								
				}
			});

		}
		$(document).delegate('.search-readmore', 'click', function (e) {
			e.preventDefault();
		//	console.log($(this).attr('data-id'));
			jQuery('.div-readmore-'+$(this).attr('data-id')).toggleClass('collapse-readmore');
			$(this).hide();
			$('.readless-'+$(this).attr('data-id')).show();
		});
		$(document).delegate('.search-readless', 'click', function (e) {
			e.preventDefault();
		//	console.log($(this).attr('data-id'));
			jQuery('.div-readmore-'+$(this).attr('data-id')).toggleClass('collapse-readmore');
			$(this).hide();
			$('.readmore-'+$(this).attr('data-id')).show();
		});
		
		// custom search suggestions
		$(document).delegate('.sr-usr-name', 'keyup', function (e) {

			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var pushstate = {};
			keyword = $(this).val();
			//console.log(keyword.length);
			if (keyword.length && keyword.length > 0) {
				jQuery('.searchclose').show();
			}
			else {
				jQuery('.searchclose').hide();
			}			
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "true";
			pushstate['lang_code'] = langcode;
			var current_path = window.location.href.split('/').pop();
			if (current_path == "help") {
				pushstate['facet'] = "help";
			}
			url = Drupal.url("search/search-autocomplete");
			searchautoTarget = $(this).closest('.search').find(".search-suggest");
			searchautoTarget.html('');
			//console.log(keyword);
			if (keyword && keyword.length > 2) {

				//getAjaxSearchContent(url, pushstate);

			} else {
				searchautoTarget.html('');
			}

		}).delegate('.sr-usr-name', 'blur', function (e) {
			searchautoTarget = $(".sr-usr-name").closest('.search').find(".search-suggest");
			searchautoTarget.html('');
		});
		// end custom search suggestions



		//search based on autocomplete value
		$(document).delegate('.auto_redirect', 'mousedown', function (event) {
			event.preventDefault();
		}).delegate('.auto_redirect', 'click', function (event) {
			event.preventDefault();
			searchautoTarget = $(".sr-usr-name").closest('.search').find(".search-suggest");
			searchautoTarget.html('');
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			$(".sr-usr-name").val("");
			var pushstate = {};
			keyword = $(this).data("id");
			//get current path
			var facet = '';
			if ($('li.helpmenu').hasClass('active')) {
				facet = "help";
			}
			if ($('li.videomenu').hasClass('active')) {
				facet = "videos";
			}
			if ($('li.filesmenu').hasClass('active')) {
				facet = "files";
			}
			if ($('li.othersmenu').hasClass('active')) {
				facet = "others";
			}
			// if ($('li.newsmenu').hasClass('active')) {
			// 	facet = "news";
			// }
			if ($('li.servicesmenu').hasClass('active')) {
				facet = "services";
			}
			if ($('li.helpfiles').hasClass('active')) {
				facet = "helpfiles";
			}
				// alert('Following is the facet value');
				// alert(facet);
			var current_path = location.pathname.slice(drupalSettings.path.baseUrl.length + drupalSettings.path.pathPrefix.length);
			if (current_path == "search") {
				if ($('li.helpmenu').hasClass('active')) {
					var facet = "allhelp";
				}
			}
			pushstate['facet'] = facet;
			
			if (current_path == "search" || current_path == "help/search") {
				if (getUrlParameter(location.search, 'low-bandwidth')) {
					window.history.replaceState(null, null, "?keyword=" + keyword + '&low-bandwidth=1');
				} else {
					window.history.replaceState(null, null, "?keyword=" + keyword);
				}

				$(".sr-usr-name").val(keyword);
				pushstate['keyword'] = keyword;
				pushstate['auto_complete'] = "false";
				pushstate['lang_code'] = langcode;
				url = Drupal.url("search/search-autocomplete");
				searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");

				if (keyword) {
					getAjaxSearchContent(url, pushstate);
				} else {
					// searchTarget.html('');
				}
			} else {

				if (current_path == "help") {
					if (getUrlParameter(location.search, 'low-bandwidth')) {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + keyword + '&low-bandwidth=1&tab=help';
					} else {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + keyword + '&tab=help';
					}
				} else {

					if (getUrlParameter(location.search, 'low-bandwidth')) {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'search?keyword=' + keyword + '&low-bandwidth=1';
					} else {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'search?keyword=' + keyword + '';
					}
				}
			}

		});

		//when click submit, search based on keyword value
		$(document).delegate('.sub-btn', 'click', function (event) {
			event.preventDefault();
			searchautoTarget = $(".sr-usr-name").closest('.search').find(".search-suggest");
			searchautoTarget.html('');
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var pushstate = {};
			var facet = '';
			if ($('li.helpmenu').hasClass('active')) {
				 facet = "help";
			}
			if ($('li.videomenu').hasClass('active')) {
				 facet = "videos";
			}
			if ($('li.filesmenu').hasClass('active')) {
				 facet = "files";
			}
			if ($('li.othersmenu').hasClass('active')) {
				 facet = "others";
			}
			if ($('li.newsmenu').hasClass('active')) {
				 facet = "news";
			}
			if ($('li.servicesmenu').hasClass('active')) {
				 facet = "services";
			}
			if ($('li.usermanual').hasClass('active')) {
				facet = "usermanual";
			}
			if ($('li.faq').hasClass('active')) {
				facet = "faq";
			}
			if ($('li.helpfiles').hasClass('active')) {
				facet = "helpfiles";
			}

			var current_path = location.pathname.slice(drupalSettings.path.baseUrl.length + drupalSettings.path.pathPrefix.length);
			if (current_path == "search") {
				if ($('li.helpmenu').hasClass('active')) {
					var facet = "allhelp";
				}
			}
			pushstate['facet'] = facet;
			var keyword = $(".sr-usr-name").val();
			var safeKeyword = encodeURIComponent(keyword);
			// console.log(keyword);
			// var current_path = location.pathname.slice(drupalSettings.path.baseUrl.length + drupalSettings.path.pathPrefix.length);
			if (current_path == "search" || current_path == "help/search") {
				if (getUrlParameter(location.search, 'low-bandwidth')) {
					window.history.replaceState(null, null, "?keyword=" + safeKeyword + '&low-bandwidth=1');
				} else {
					window.history.replaceState(null, null, "?keyword=" + safeKeyword);
				}
				pushstate['keyword'] = keyword;
				pushstate['auto_complete'] = "false";
				pushstate['lang_code'] = langcode;
				url = Drupal.url("search/search-autocomplete");
				searchTarget = $(this).closest('.search').find(".search-results");

				getAjaxSearchContent(url, pushstate);
			} else {

				if (current_path == "help") {
					if (getUrlParameter(location.search, 'low-bandwidth')) {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + safeKeyword + '&low-bandwidth=1&tab=help';
					} else {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + safeKeyword + '&tab=help';
					}
				} else {

					if (getUrlParameter(location.search, 'low-bandwidth')) {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'search?keyword=' + safeKeyword + '&low-bandwidth=1';
					} else {
						window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'search?keyword=' + safeKeyword + '';
					}
				}
			}

		});

		// Pager
		if (current_path == "search" || current_path == "help/search") {
			$(document).delegate('.pager__item a', 'click', function (event) {

				event.preventDefault();
				//get current langcode
				var langcode = drupalSettings.path.pathPrefix.replace('/', '');
				if (langcode == '') {
					langcode = "en";
				}
				var keyword = '';
				if (getUrlParameter(location.search, 'keyword')) {
					keyword = getUrlParameter(location.search, 'keyword');
				}
				var pushstate = {};
				var facet = '';
				if ($('li.helpmenu').hasClass('active')) {
					 facet = "help";
				}
				if ($('li.videomenu').hasClass('active')) {
					 facet = "videos";
				}
				if ($('li.filesmenu').hasClass('active')) {
					 facet = "files";
				}
				if ($('li.othersmenu').hasClass('active')) {
					 facet = "others";
				}
				// if ($('li.newsmenu').hasClass('active')) {
				// 	 facet = "news";
				// }
				if ($('li.servicesmenu').hasClass('active')) {
					 facet = "services";
				}
				if ($('li.usermanual').hasClass('active')) {
					facet = "usermanual";
				}
				if ($('li.faq').hasClass('active')) {
					facet = "faq";
				}
				if ($('li.helpfiles').hasClass('active')) {
					facet = "helpfiles";
				}

				if (current_path == "search") {
					if ($('li.helpmenu').hasClass('active')) {
						var facet = "allhelp";
					}
				}

				pushstate['facet'] = facet;
				pushstate['keyword'] = keyword;
				pushstate['auto_complete'] = "false";
				pushstate['lang_code'] = langcode;
				//url = "http://localhost/itd_new/web/search/search-autocomplete";
				url = Drupal.url("search/search-autocomplete");
				var currentpage = parseInt(getUrlParameter($(this).attr('href'), 'page'));
				pushstate['page'] = currentpage;
				searchTarget = $(this).closest('.search').find(".search-results");
				// searchTarget.html('');
				getAjaxSearchContent(url, pushstate);
				$(window).scrollTop(0);

			});
		}
		//when click All facet,
		$(document).delegate('#all_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			//url = "http://localhost/itd_new/web/search/search-autocomplete";
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			// searchTarget.html('');
			//console.log(keyword);
			getAjaxSearchContent(url, pushstate);

		});

		//when click help facet,
		// $(document).delegate('#help_tab', 'click', function (event) {
		// 	event.preventDefault();
		// 	//get current langcode
		// 	var langcode = drupalSettings.path.pathPrefix.replace('/', '');
		// 	if (langcode == '') {
		// 		langcode = "en";
		// 	}
		// 	var keyword = '';
		// 	if (getUrlParameter(location.search, 'keyword')) {
		// 		keyword = getUrlParameter(location.search, 'keyword');
		// 	}
		// 	if (getUrlParameter(location.search, 'low-bandwidth')) {
		// 		window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + keyword + '&low-bandwidth=1&tab=help';
		// 	} else {
		// 		window.location = drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + 'help/search?keyword=' + keyword + '&tab=help';
		// 	}

		// });

		//when click help facet,
		$(document).delegate('#help_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "help";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click all help facet,
		$(document).delegate('#all_help_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "allhelp";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click videos facet,
		$(document).delegate('#videos_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "videos";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click files facet,
		$(document).delegate('#files_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "files";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click others facet,
		$(document).delegate('#others_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "others";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);
		});

		//when click News facet,
		$(document).delegate('#news_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "news";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click services facet,
		$(document).delegate('#services_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "services";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click usermanual facet,
		$(document).delegate('#usermanual_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "usermanual";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click faq facet,
		$(document).delegate('#faq_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "faq";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		//when click helpfiles facet,
		$(document).delegate('#helpfiles_tab', 'click', function (event) {
			event.preventDefault();
			//get current langcode
			var langcode = drupalSettings.path.pathPrefix.replace('/', '');
			if (langcode == '') {
				langcode = "en";
			}
			var keyword = '';
			if (getUrlParameter(location.search, 'keyword')) {
				keyword = getUrlParameter(location.search, 'keyword');
			}
			var pushstate = {};
			pushstate['facet'] = "helpfiles";
			pushstate['keyword'] = keyword;
			pushstate['auto_complete'] = "false";
			pushstate['lang_code'] = langcode;
			url = Drupal.url("search/search-autocomplete");
			searchTarget = $(".sr-usr-name").closest('.search').find(".search-results");
			getAjaxSearchContent(url, pushstate);

		});

		function getAjaxSearchContent(url, pushstate) {
			lastSearchRequest && lastSearchRequest.abort();
			var results = $.ajax({
				url: url,
				type: 'GET',
				data: pushstate,
				success: function (response) {

					if (pushstate['auto_complete'] !== "" && pushstate['auto_complete'] == "true") {
						if (response.success) {
							searchautoTarget.html(response.data_suggest);
						} else {
							searchautoTarget.html('');
						}
					} else {
						searchTarget.html(DOMPurify.sanitize(response.data));
                          $('.searchnumber').html(DOMPurify.sanitize(response.search_count + "&nbsp;results"));
                          $('.help_count').html(DOMPurify.sanitize("(" + response.help_count + ")"));
                          $('.videos_count').html(DOMPurify.sanitize("(" + response.videos_count + ")"));
                          $('.files_count').html(DOMPurify.sanitize("(" + response.files_count + ")"));
                          $('.others_count').html(DOMPurify.sanitize("(" + response.others_count + ")"));
                       // $('.news_count').html(DOMPurify.sanitize("(" + response.news_count + ")")); // if needed
                          $('.usermanual_count').html(DOMPurify.sanitize("(" + response.usermanual_count + ")"));
                          $('.services_count').html(DOMPurify.sanitize("(" + response.services_count + ")"));
                          $('.faq_count').html(DOMPurify.sanitize("(" + response.faq_count + ")"));
                          $('.helpfiles_count').html(DOMPurify.sanitize("(" + response.helpfiles_count + ")"));
                          $('.all_count').html(DOMPurify.sanitize("(" + response.allcount + ")"));
					}

				}
			});
			lastSearchRequest = results;
			return results;
		}
		//find query parameter from url
		function getUrlParameter(url, name) {
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
			var results = regex.exec(url);
			return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
		}

		//handle clicks on video thumbnail to open video embed link
		$(document).delegate('.field--name-field-video-thumbnail', 'click', function (e) {
			e.preventDefault();
			// Find the video embed link in the same article
			var videoEmbedLink = $(this).closest('article').find('.field--name-field-video-embed.field--item a').attr('href');
			if (videoEmbedLink && videoEmbedLink !== '#') {
				window.location.href = videoEmbedLink;
			}
		});

	});

}(jQuery));

