var elasticsearch = require('./elasticsearchClient');
var clientElasticsearch=elasticsearch.client;
var extend = require('util')._extend;

/**
 * Search in Elastisearch
 * @returns
 */
function searchElasticSearch(options){
	// Search all incoherence not in blacklist
	return clientElasticsearch.search(options)
	.catch(console.log);
}


exports.searchElasticSearch=searchElasticSearch;