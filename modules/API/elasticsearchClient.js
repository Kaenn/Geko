/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var elasticsearch = require('elasticsearch');
var Q = require('q');

var clientElasticsearch = new elasticsearch.Client({
  host: 'localhost:9200'
});
console.log("ElasticSearch : OK");


exports.clientElasticsearch = clientElasticsearch;