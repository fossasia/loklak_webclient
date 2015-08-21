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
			'logo': '/images/external/fossasia.png',
			'template': {
				'header' : 'text',
				'subHeader': 'metacommunity'
			}
		},
		'openwifimap':
		{
			'key': 'OPENWIFIMAP',
			'name': 'Openwifimap',
			'endpoint': 'openwifimap.json',
			'logo': '/images/external/freifunk.net.png',
			'template': {
				'header' : 'id',
				'subHeader': 'value.hostname'
			}
		},
		'nodelist':
		{
			'key': 'NODELIST',
			'name': 'Nodelist',
			'endpoint': 'nodelist.json',
			'logo': '/images/external/freifunk.net.png',
			'template': {
				'header' : 'name',
				'subHeader': 'id'
			}
		},
		'netmon':
		{
			'key': 'NETMON',
			'name': 'Netmon',
			'endpoint': 'netmon.xml',
			'logo': '/images/external/freifunk.net.png',
			'template': {
				'header' : 'hostname',
				'subHeader': 'router_id'
			}
		},
		'freifunk_node':
		{
			'key': 'FREIFUNK_NODE',
			'name': 'Freifunk Node',
			'endpoint': 'freifunknode.json',
			'logo': '/images/external/freifunk.net.png',
			'template': {
				'header' : 'name',
				'subHeader': 'hardware'
			}
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