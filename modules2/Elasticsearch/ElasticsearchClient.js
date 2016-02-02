/**
 * @author : Kaenn
 */
var elasticsearch = require('elasticsearch');
var Q = require('q');

var client = new elasticsearch.Client({
	host: 'localhost:9200'
});
console.log("ElasticSearch : OK");


module.exports  = client;