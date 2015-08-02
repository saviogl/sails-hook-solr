var helpers = require('./_helpers'),
		Q = require('q');

var deferred = Q.defer();

module.exports = function (query, cb) {
	var Model = this;
	var client = Model.solrClient;

	client.ping(function (err, obj) {
		if ( err ) {
			sails.log.error('sails-hook-solr:: pingToClient');
			sails.log.error('sails-hook-solr:: no connection could be established');
			return deferred.reject(new Error(err));
		}

		client.deleteByQuery(query, function (err, obj){
			if ( err ) {
				sails.log.error('sails-hook-solr:: deleteByQuery');
				sails.log.error('sails-hook-solr:: delete from index');
				sails.log.error('sails-hook-solr:: error: ', err);
				return deferred.reject(new Error(err));
			}

			// Commit your changes without options
			client.commit( function (err, res){
			  if ( err ) {
					sails.log.error('sails-hook-solr:: deleteByQuery');
					sails.log.error('sails-hook-solr:: commit changes');
					sails.log.error('sails-hook-solr:: error: ', err);
					return deferred.reject(new Error(err));
			  }

			  return deferred.resolve(obj);
			});
		});
	});

	return deferred.promise.nodeify(cb);
};