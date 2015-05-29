var helpers = require('./_helpers'),
		Q = require('q');

var deferred = Q.defer();

module.exports = function (records, cb) {
	var Model = this;
	var client = Model.solrClient;

	if ( arguments.length < 1 ) {
		sails.log.error('updateSolrQuery:: You gotta pass in an array with the records to be uploaded');
		deferred.reject(new Error('Missing arguments'));
	}

	if ( !sails.config.solr.schemas[Model.name] ) {
		sails.log.error('updateSolrQuery:: You gotta define a schema for sails.config.solr.schemas[\'' + Model.name + '\']');
		deferred.reject(new Error('No schema defined'));
	}

	if ( !records.length ) {
		sails.log.warn('updateSolrQuery:: you passed in an empty array');
		deferred.reject(new Error('No data to be updated'));
	}

	client.ping(function (err, obj) {
		if ( err ) {
			sails.log.error('sails-hook-solr:: pingToClient');
			sails.log.error('sails-hook-solr:: no connection could be established');
			return deferred.reject(new Error(err));
		}

		helpers.applyModelSchema(Model, records, function (err, solrDocs){
			if ( err ) {
				return deferred.reject(new Error(err));
			}

			client.add(solrDocs.map(helpers.solrJSONParserMap), function (err, obj){
				if ( err ) {
					sails.log.error('sails-hook-solr:: updateSolr');
					sails.log.error('sails-hook-solr:: add to index');
					sails.log.error('sails-hook-solr:: error: ', err);
					return deferred.reject(new Error(err));
				}

				// Commit your changes without options
				client.commit( function (err, res){
				  if ( err ) {
						sails.log.error('sails-hook-solr:: updateSolr');
						sails.log.error('sails-hook-solr:: commit changes');
						sails.log.error('sails-hook-solr:: error: ', err);
						return deferred.reject(new Error(err));
				  }

				  return deferred.resolve(helpers.buildResponse(obj, solrDocs));
				});
			});
		});
	});

	return deferred.promise.nodeify(cb);
}