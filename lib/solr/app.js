var _ = require('lodash'),
  solr = require('solr-client');

module.exports = {
  prepareModels: function (sails, cb) {

    _.forEach(sails.models, function (obj, model) {
      var solrOpts = (typeof sails.config.solr.client === 'object') ? sails.config.solr.client : {};
      solrOpts.core = model;
      // Create a Solr client object for the model
      obj.solrClient = solr.createClient(solrOpts);
      // Class Methods - Begin
      // Create an updateSolrQuery method for the model which will fetch automatically the data and populateAll fields
      obj.name = model;
      obj.updateSolrQuery = require('./_updateSolrQuery').bind(obj);
      // Create an updateToSolr method for the model to expose to the user's need the abilitiy of apply custom queries and send the results to solr
      obj.updateToSolr = require('./_updateToSolr').bind(obj);
      // Create an deleteFromSolr method for the model which will delete documents from index based for a given query
      obj.deleteSolrQuery = require('./_deleteFromSolr').bind(obj);
      // Create an deleteFromSolr method for the model which will delete documents from index based for a given query
      obj.deleteSolrById = require('./_deleteFromSolrById').bind(obj);
      // Class Methods - End
    });

    cb();
  }
};
