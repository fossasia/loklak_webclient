'use strict';
// jshint laxbreak:true

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function MapPopUpTemplateService($filter) {

  var service = {};

  service.genStaticTwitterStatus = function(status) {
  	var result = "";
  	var text = $filter('tweetHashtag')($filter('tweetMention')($filter('tweetTextLink')(status.text)));
  	var created_at = $filter('date')(status.created_at, 'dd MMM yyyy');
    var placetext="";
    if ((status.location_source === "REPORT" || status.location_source === "PLACE") && status.location_source) { placetext='<span class="fa fa-map-marker text">'+status.place_name+'</span>'; }

  	result='<div class="single-tweet tweet map-tweet">'
  		+			 '<div class="top-metadata">'
  		+				'<img class="avatar"' 
  		+					 'onError="this.onerror=null;this.src=\'/images/anon_200x200.png\';"'
  		+					 'src="' + status.user.profile_image_url_https + '" alt="user-images">'
  		+			   '<div class="user-data-wrapper">'
  		+			    	'<a class="name" href="' + './search?q=from:' + status.user.screen_name + '">' + status.user.name + '</a>'			
  		+			   	'<span class="screen-name">' + '@' + status.user.screen_name + '</span>'	
  		+			    '</div>'
  		+			'</div>'
  		+ 			'<p class="tweet-content-text">' + text +  '</p>'
  		+				'<div class="detail-metadata">'
  		+			    	'<span class="metadata">' + created_at + '</span> · '
      +             placetext
  		+				'</div>'        
  		+			'</div>'
  		+		'</div>';

  	return result;
  };

  service.genUserInfoPopUp = function(status) {
    var result = "Failed loading data from twitter";
    var title = (status.isAFollower) ? 'Follower' : 'Following';
    result = '<h4>' + title + '</h4>'
            +'<div class="home-user-info" style="width:300px;">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+status.profile_background_image_url_https+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+status.profile_image_url_https+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+status.name+'</span><br>'
            +               '<span class="home-user-screen-name">@'+status.screen_name+'</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+status.statuses_count+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+status.friends_count+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+status.followers_count+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>';

    return result;


  };

  return service;

}

servicesModule.service('MapPopUpTemplateService', ['$filter', MapPopUpTemplateService]);
