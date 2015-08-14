'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
// this should really come from loklak server to stay DRY
function SourceTypeService() {

	var service = {};

	service.sourceTypeList =
	{
		'fossasia_api':
		{
			'key': 'FOSSASIA_API',
			'name': 'FOSSASIA API',
			'endpoint': 'fossasia.json',
			'logo': '/images/external/fossasia.png'
		},
		'openwifimap':
		{
			'key': 'OPENWIFIMAP',
			'name': 'Openwifimap',
			'endpoint': 'openwifimap.json',
			'logo': '/images/external/freifunk.net.png'
		},
		'nodelist':
		{
			'key': 'NODELIST',
			'name': 'Nodelist',
			'endpoint': 'nodelist.json',
			'logo': '/images/external/freifunk.net.png'
		},
		'netmon':
		{
			'key': 'NETMON',
			'name': 'Netmon',
			'endpoint': 'netmon.xml',
			'logo': '/images/external/freifunk.net.png'
		},
		'freifunk_node':
		{
			'key': 'FREIFUNK_NODE',
			'name': 'Freifunk Node',
			'endpoint': 'freifunk_node.json',
			'logo': '/images/external/freifunk.net.png'
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