var helpers = require('./_helpers');

module.exports = function (records, cb) {
	var Model = this;
	var arguments = _.toArray(arguments);
	var client = Model.solrClient;

	if ( arguments.length < 2 ) {
		sails.log.error('updateSolrQuery:: You gotta pass in an array with the records to be uploaded, and a callback function');
		throw new Error('Missing arguments');
	} else if ( !_.isArray(records) ) {
		if ( _.isFunction(cb) ) {
			sails.log.error('updateSolrQuery:: You gotta pass in an array with the records to be uploaded as first argument');
			return cb(new Error('Invalid argument type'));
		} else {
			sails.log.error('updateSolrQuery:: You gotta pass in an array with the records to be uploaded as first argument');
			throw new Error('Invalid argument type');
		}
	} else {
		if ( !_.isFunction(cb) ) {
			sails.log.error('updateSolrQuery:: You gotta pass in a callback function as second argument');
			throw new Error('Invalid argument type');
		}
	}

	if ( !sails.config.solr.schemas[Model.name] ) {
		sails.log.error('updateSolrQuery:: You gotta define a schema for sails.config.solr.schemas[\'' + Model.name + '\']');
		return cb(new Error('No schema defined'));
	}

	if ( !records.length ) {
		sails.log.warn('updateSolrQuery:: you passed in an empty array');
		return cb('No data to be updated');
	}

	client.ping(function (err, obj) {
		if ( err ) {
			sails.log.error('sails-hook-solr:: pingToClient');
			sails.log.error('sails-hook-solr:: no connection could be established');
			return cb(new Error(err));
		}

		helpers.applyModelSchema(Model, records, function (err, solrDocs){
			if ( err ) {
				return cb(err);
			}

			client.add(solrDocs.map(helpers.solrJSONParserMap), function (err, obj){
				if ( err ) {
					sails.log.error('sails-hook-solr:: updateSolr');
					sails.log.error('sails-hook-solr:: add to index');
					sails.log.error('sails-hook-solr:: error: ', err);
					return cb(new Error(err));
				}

				// Commit your changes without options
				client.commit( function (err, res){
				  if ( err ) {
						sails.log.error('sails-hook-solr:: updateSolr');
						sails.log.error('sails-hook-solr:: commit changes');
						sails.log.error('sails-hook-solr:: error: ', err);
						return cb(new Error(err));
				  }

				   return cb(null, helpers.buildResponse(obj, solrDocs));
				});
			});
		});
	});
}