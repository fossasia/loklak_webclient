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
            +        '<img src="'+followers[i].profile_banner+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+followers[i].propic+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+followers[i].name+'</span><br>'
            +               '<span class="home-user-screen-name">@'+followers[i].screenname+'</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+followers[i].tweetcount+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+followers[i].following+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+followers[i].followers+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };
 service.genStaticTwitterFollowing = function(following , i) {
    var textstatus = $filter('tweetHashtag')($filter('tweetMention')($filter('tweetTextLink')(following[i].latesttweet)));
    var result = "";
    
    result = '<div class="home-user-info" style="width:300px;">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+following[i].profile_banner+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+following[i].propic+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+following[i].name+'</span><br>'
            +               '<span class="home-user-screen-name">@'+following[i].screenname+'</span>'
            +            '</div>'      
            +       '</div>'
            +       '<div style="word-wrap: break-word; padding : 0px 10px;">'
            +       '<h5>'+textstatus+'</h5>'
            +        '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+following[i].tweetcount+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+following[i].following+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+following[i].followers+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };



  return service;

}

servicesModule.service('FollowersMapTemplateService', ['$filter', FollowersMapTemplateService]);
