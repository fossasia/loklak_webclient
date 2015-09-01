'use strict';
// jshint laxbreak:true

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function MapPopUpTemplateService($filter, SourceTypeService, JsonFieldAccessorService, RichTextService) {

  var service = {};

  service.genImportedStatus = function(status, profile) {
    var sourceType = SourceTypeService.sourceTypeList[status.source_type.toLowerCase()];

    var richData = RichTextService.parseJSON(status.text)[1];

    var shareNum;
    if (!profile.sharers) {
      shareNum = 0;
    } else {
      shareNum = profile.sharers.length;
    }
    var result = '<div ng-attr-id="' + status.id_str + '" class="single-imported-status map-view">'
      +     '<div class="body">'
      +       '<div class="right-logo">'
      +         '<img src="' + sourceType.logo + '"/>'
      +        '</div>'
      +       '<h3>' + JsonFieldAccessorService.accessField(richData, sourceType.template.header) + '</h3>'
      +       JsonFieldAccessorService.accessField(richData, sourceType.template.subHeader)
      +     '</div>'
      +   '<div class="footer">'
      +     '<p>Shared by ' + shareNum + ' users</p>'
      +     '<hr/>'
      +   '</div>'
      +  '</div>';

      return result;
  };

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
    var title;

    if (status.isAFollower && status.isAFollowing) {
      title = '<h4 id="user-' + status.id_str + '" class="follower-and-following-button">Follower/Following</h4>';
    } else if (status.isAFollowing) {
      title = '<h4 id="user-' + status.id_str + '" class="following-button">Following</h4>';
    } else {
      title = '<h4 id="user-' + status.id_str + '" class="follower-button">Follower</h4>';
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

  return service;

}

servicesModule.service('MapPopUpTemplateService', ['$filter', 'SourceTypeService', 'JsonFieldAccessorService', 'RichTextService', MapPopUpTemplateService]);
