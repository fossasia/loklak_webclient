'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	service.sourceTypeList =
	{
		'fossasia_api':
		{
			'key': 'FOSSASIA_API',
			'name': 'Fossasia API',
			'endpoint': 'fossasia.json'
		},
		'openwifimap':
		{
			'key': 'OPENWIFIMAP',
			'name': 'Openwifimap wifi router',
			'endpoint': 'openwifimap.json'
		},
		'nodelist':
		{
			'key': 'NODELIST',
			'name': 'Nodelist wifi router',
			'endpoint': 'nodelist.json'
		},
		'netmon':
		{
			'key': 'NETMON',
			'name': 'Netmon wifi router',
			'endpoint': 'netmon.xml'
		},
		'freifunk_node':
		{
			'key': 'FREIFUNK_NODE',
			'name': 'Freifunk node wifi router',
			'endpoint': 'freifunk_node.json'
		},
		'ninux':
		{
			'key': 'NINUX'
			// no name & endpoint means no individual add connection page. NINUX source is added using geojson
		}
	};

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);