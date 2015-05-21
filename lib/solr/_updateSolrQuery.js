var _ = require('lodash'),		
		helpers = require('./_helpers');

module.exports = function (opts, cb) {
	var Model = this;
	var arguments = _.toArray(arguments);

	if ( !arguments.length ) {
		sails.log.error('updateSolrQuery:: You gotta at least pass in a callback function!');
		throw new Error('Missing arguments');
	}

	if ( !sails.config.solr.schemas[Model.name] ) {
		sails.log.error('updateSolrQuery:: You gotta define a schema for sails.config.solr.schemas[\'' + Model.name + '\']');
		return cb(new Error('No schema defined'));
	}

	if ( typeof opts === 'function' && arguments.length === 1 ) {
		cb = opts;
		opts = {};
	}

	var client = Model.solrClient;

	client.ping(function (err, obj) {
		if ( err ) {
			sails.log.error('we-plugin-solr:: pingToClient');
			sails.log.error('we-plugin-solr:: no connection could be established');
			return cb(new Error(err));
		}

		Model
		.find(opts)
		.populateAll()
		.exec(function (err, records){
			if ( err ) {
				sails.log.error('we-plugin-solr:: updateSolr');
				sails.log.error('we-plugin-solr:: find');
				sails.log.error('we-plugin-solr:: error: ', err);
				return cb(err);
			}

			if ( !records.length ) {
				sails.log.warn('we-plugin-solr:: updateSolr');
				sails.log.warn('we-plugin-solr:: no records found');
				return cb(null, []);
			}

			helpers.applyModelSchema(Model, records, function (err, solrDocs){
				if ( err ) {
					return cb(err);
				}

				client.add(solrDocs.map(helpers.solrJSONParserMap), function (err, obj){
					if ( err ) {
						sails.log.error('we-plugin-solr:: updateSolr');
						sails.log.error('we-plugin-solr:: add to index');
						sails.log.error('we-plugin-solr:: error: ', err);
						return cb(new Error(err));
					}

					// Commit your changes without options
					client.commit( function (err, res){
					  if ( err ) {
							sails.log.error('we-plugin-solr:: updateSolr');
							sails.log.error('we-plugin-solr:: commit changes');
							sails.log.error('we-plugin-solr:: error: ', err);
							return cb(new Error(err));
					  }

					   return cb(null, helpers.buildResponse(obj, solrDocs));
					});
				});
			});
		});
	});
}