'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function FollowersMapTemplateService($filter) {

  var service = {};

  service.genStaticTwitterFollower = function() {
    var result = "";
    result = '<div class="home-user-info">'
            +   '<div class="blue-background-placeholder">'
            +        '<img ng-src="{{root.twitterSession.profile_banner_url}}" alt="user-banner-photo" ng-show="root.twitterSession.profile_banner_url">'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img ng-src="{{root.twitterSession.profile_image_url_https}}">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">{{root.twitterSession.name}}</span><br>'
            +               '<span class="home-user-screen-name">@{{root.twitterSession.screen_name}}</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>{{root.twitterSession.statuses_count}}</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>{{root.twitterSession.friends_count}}</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>{{root.twitterSession.followers_count}}</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };




  return service;

}

servicesModule.service('FollowersMapTemplateService', ['$filter', FollowersMapTemplateService]);