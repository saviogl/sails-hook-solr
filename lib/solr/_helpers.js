var _ = require('lodash'),
		async = require('async');

var self = module.exports = {
	buildResponse: function (res, docs) {
		// body...
		return _.assign(res, {
			docsUpdated: docs.length
		});
	},

	solrJSONParserMap: function ( model ) {
		// body...
		_.forEach(model, function ( value, key ){
			// Remove null values
			if( value === null && typeof value === 'object' ) {
				delete model[key];
			}
		});

		return model;
	},

	applyModelSchema: function ( model, records, callback ){
		var schema = sails.config.solr.schemas[model.name];

		var associations = model.associations;
		var indexByAlias = _.indexBy(associations, 'alias');

		async.map(records, function (r, doneMap){
			var doc = {};

			async.forEachOf(schema, function (options, key, doneEachOf){
				var opts = options || {};
				var field = opts.copy ? opts.from : key;

				if ( !r[field] ) {
					sails.log.silly('No attribute `' + field + '`found for this model');
					return doneEachOf(null);
				}

				var type = indexByAlias[field] ? indexByAlias[field].type : 'plain';

				if ( typeof opts.field === 'function' ) {
					opts.field(r, indexByAlias[field].model, function (err, fieldToCopy){
						if ( err ) {
							return doneEachOf(err);
						}
						doc[key] = fieldToCopy;
						return doneEachOf(null);
					});
				} else {
					doc[key] = self.copyField(r[field], opts.field || 'id', type);
					return doneEachOf(null);
				}
			}, function (err){
				if ( err ) {
					return doneMap(err);
				}
				doneMap(null, doc);
			});

		}, function (err, solrDocs){
			if ( err ) {
				return callback(err);
			}
			callback(null, solrDocs);
		});

	},

	copyField: function (value, key, type){
		var copiedField;

		switch ( type ){
			case 'collection':
				copiedField = value.map(function (v){
					return v[key] ? v[key] : v.id;
				});
				break;
			case 'model':
				copiedField = value[key] ? value[key] : value.id;
				break;
			default:
				if ( _.isPlainObject(value) ) {
					//TODO
					break;
				} else {
					copiedField = value;
					break;
				}
		}

		return copiedField;
	}
}