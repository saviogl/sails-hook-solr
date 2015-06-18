var _ = require('lodash'),		
		helpers = require('./_helpers'),
		Q = require('q');

var deferred = Q.defer();

module.exports = function (opts, cb) {
	var Model = this;

	if ( !sails.config.solr.schemas[Model.name] ) {
		sails.log.error('updateSolrQuery:: You gotta define a schema for sails.config.solr.schemas[\'' + Model.name + '\']');
		deferred.reject(new Error('No schema defined'));
	}

	opts = _.isPlainObject(opts) ? opts : {};

	var client = Model.solrClient;

	client.ping(function (err, obj) {
		if ( err ) {
			sails.log.error('sails-hook-solr:: pingToClient');
			sails.log.error('sails-hook-solr:: no connection could be established');
			return deferred.reject(new Error(err));
		}

		Model
		.find(opts)
		.populateAll()
		.exec(function (err, records){
			if ( err ) {
				sails.log.error('sails-hook-solr:: updateSolr');
				sails.log.error('sails-hook-solr:: find');
				sails.log.error('sails-hook-solr:: error: ', err);
				return deferred.reject(new Error(err));
			}

			if ( !records.length ) {
				sails.log.warn('sails-hook-solr:: updateSolr');
				sails.log.warn('sails-hook-solr:: no records found');
				return deferred.resolve([]);
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
	});

	return deferred.promise.nodeify(cb);
}