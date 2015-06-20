'use strict';

var directivesModule = require('./_index.js');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
/**
 * @ngInject
 */
function mapLayoutDirective() {

  return {
    scope: {
    	data: '=',
    },
    link: function (scope, element){
    	//code here
    	element.text="kdjfjdn";
    }
  };

}

directivesModule.directive('mapLayout', mapLayoutDirective);