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
  	var created_at = $filter('date')(status.created_at, 'dd MMM yyyy hh:mm:ss');
    var placetext="";
    var linkToTweet = (status.id_str) ? ("./tweet?q=id:" + status.id_str) : "#";
    if ((status.location_source === "REPORT" || status.location_source === "PLACE") && status.location_source) { placetext='<i class="fa fa-map-marker text"></i>&nbsp'+status.place_name; }

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
      +           '<a href="' + linkToTweet + '" class="from-map-to-single-tweet">Details</a>'   
  		+			    	'<span class="metadata">' + created_at + '</span> · '
      +             placetext
  		+				'</div>'        
  		+			'</div>'
  		+		'</div>';

  	return result;
  };

  service.genUserInfoPopUp = function(status) {
    var result = "Failed loading data from twitter";

    if (status.isAFollower && status.isAFollowing) {
      var title = '<h4 id="user-' + status.id_str + '" class="follower-and-following-button">Follower/Following</h4>'
    } else if (status.isAFollowing) {
      var title = '<h4 id="user-' + status.id_str + '" class="following-button">Following</h4>'
    } else {
      var title = '<h4 id="user-' + status.id_str + '" class="follower-button">Follower</h4>'
    }

    var location = (status.location) ? '<span class="twitter-api-user-location"> - ' + status.location + ', ' + status.location_country + '</span>' : '';

    var infoText = (status.description) ? '<div class="user-info-text">' + status.description + '</div>' : ''; 
    
    result = '<div class="home-user-info" style="width:300px;">' 
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+status.profile_background_image_url_https+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+status.profile_image_url_https+'">'
            +            title
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+status.name+'</span>'
            +               '<span class="home-user-screen-name">@'+status.screen_name+'</span>'
            +               location
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
            +         infoText
            +    '</div>'
            +'</div>';

    return result;


  };
  service.InstaInfoPopUp = function(data) {
    var result;
    
    result = '<div class=container style="width:300px">'
    +           '<img class=img-circle src=' + data.user.profile_picture + ' width="50px">'
    +                '<span class="home-user-name"> <b>'+data.user.full_name+'</b></span>'
    +             '<img class=circle src=' + data.images.standard_resolution.url + ' style="width:275px; marigin-top:2px;">'
    +             '<h5>'+data.caption.text+'</h5>'
    +       '</div>'

    return result;


  };

  return service;

}

servicesModule.service('MapPopUpTemplateService', ['$filter', MapPopUpTemplateService]);
