var solr = require('./solr/app');

module.exports = function(sails) {
  var hook =  {
    // Implicit default configuration
    // (mixed in to `sails.config`)
    defaults: {
      solr: {
        client: {
          host: 'localhost', // - IP address or host address of the Solr server
          port: '8983', // - port of the Solr server
          path: '/solr', // - root path of all requests
          secure: false, // - if true HTTPS will be used instead of HTTP
          bigint: false // - if true JSONbig serializer/deserializer will be used instead
        }
      }
    },
    initialize: function(cb) {
      sails.on('hook:orm:loaded', function (){
        solr.prepareModels(sails, function (){
          sails.log.verbose('sails-hook-solr:: done!');
        });
      });
      return cb();
    }
  };
  return hook;
};