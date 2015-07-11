'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function FollowersMapTemplateService($filter) {

  var service = {};

  service.genStaticTwitterFollower = function(followers , i) {
    var result = "";
    
    result ='<div class="home-user-info" style="width:300px;">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+followers.profile_banner[i]+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+followers.propic[i]+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+followers.name[i]+'</span><br>'
            +               '<span class="home-user-screen-name">@'+followers.screenname[i]+'</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+followers.tweetcount[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+followers.following[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+followers.followers[i]+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };
 service.genStaticTwitterFollowing = function(following , i) {
    var textstatus = $filter('tweetHashtag')($filter('tweetMention')($filter('tweetTextLink')(following.latesttweet[i])));
    var result = "";
    
    result = '<div class="home-user-info" style="width:300px;">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+following.profile_banner[i]+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+following.propic[i]+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+following.name[i]+'</span><br>'
            +               '<span class="home-user-screen-name">@'+following.screenname[i]+'</span>'
            +            '</div>'      
            +       '</div>'
            +       '<div class="bottom-content" style="overflow-x:scroll;">'
            +'<h4>'+textstatus+'</h4>'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+following.tweetcount[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+following.following[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+following.followers[i]+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };



  return service;

}

servicesModule.service('FollowersMapTemplateService', ['$filter', FollowersMapTemplateService]);
