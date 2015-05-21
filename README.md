# Sails Hook Solr
This hook allows any Sails.js Model defined to easily integrate to a Solr http://lucene.apache.org/solr/ server by exposing functionalities built on top of the http://lbdremy.github.io/solr-node-client/ as Model's class methods and Model's properties.

## Solr Configuration
Bellow you can see the default `config.client` object which is used to create a client instance in order to connect to Solr server.

Any parameter can be override by setting them in your own project.

Look for `createClient()`  in http://lbdremy.github.io/solr-node-client/code/solr.js.html for a list of the available parameters.
```javascript
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
```
> During the creation of the sorl clients, this hook sets the `core` property (not listed above) as the Model's name taken from the `sails.models` object, so each solr client will connect to its corresponding sorl core.

## Solr Client
The solr client is created and exposed for all Models so you can harness the full power of the http://lbdremy.github.io/solr-node-client/.

```javascript
var sorlClient =  Model.solrClient
```

With solrClient in hands you can perform any method provided by `solr-node-client`.

## Class Methods
In order to speed up the integration of the Sails.js projects and Solr, this hook exposes a few useful `Class Methods` to the models:
### updateSolrQuery(opts, callback)
This method retrieves all records from a given query (`opts`), populates all associations and update these documents to the solr corresponding index/core.
> This hook uses `find(opts).populateAll()` to fetch data.

#### @param {object} opts
> More information on available query parameters in http://sailsjs.org/#!/documentation/concepts/ORM/Querylanguage.html?q=query-language-basics

#### @param {function} callback
The callback function is treated as a standard callback node function receiving an `err` and `res` objects.

Example of successful response `res`:
```javascript
{
	responseHeader: {
		status: 0,
		QTime: 61
	},
	docsUpdated: 10
}
```
----------
Below an example on how to proper call this method:
```javascript
Model.updateSolrQuery({
	where: { name: 'foo' },
	skip: 20,
	limit: 10
}, function(err, res){
	if ( err ) {
		console.log(err)
	}
	console.log(res.docsUpdated)
});
```
### updateToSolr(records, cb)
This method updates a set of records to the solr corresponding index/core.

The motivation behind this method is to give the user the ability to built custom queries taking the most advantage of its database implementation and adapter to gather the intended data.

> Let's say, for instance, that the user is not satisfied by the performance of the default `Waterline` find() implementation and wants to use the `query` or `native` methods to build custom queries on `SQL` and `NoSQL` databases. One would simply gather the data as desired and pass it on to this method to update the corresponding index.

----------
Below an example on how to proper call this method:
```javascript
Model.updateToSolr(docsToUpdate, function(err, res){
	if ( err ) {
		console.log(err)
	}
	console.log(res.docsUpdated)
});
```
### Schemas
But wait ?! How does the sails-hook-solr knows which fields we want to upload to solr index? One might only want to upload a few fields to relieve the burden of its solr server, or even denormalise some associations copying only the informations needed from the relation.

To better integrate with solr and give more power to the user, the hook apply an adapted concept of solr called `Schema`.

The idea of the `schema` configuration is to tell the hook how does one want to map the fields from the application model to solr index.

As seen bellow this configuration is set in `config.solr.schemas[Model]`.

> Attention !!! In order to use both class methods above, you have got to define a `schema` for the desired model, otherwise an error will be thrown

```javascript
module.exports.solr = {
	schemas: {
		model: {
			id: {},
			field1: {},
			field2_field: { copy: true, from: 'othermodel', field: 'field' },
			field3_more: { copy: true, from: 'othermodel', field: function( record, model, callback ){
				sails.models[model]
				.findOneById(record.field.id)
				.exec(function (err, r){
					if ( err ) {
						return callback(err);
					}

					if ( r && r.course && r.course.length ) {
						return callback(null, _.last( _.sortBy(r.course, 'endyear') ).name);
					}

					callback(null, null);
				})
			}},
		}
	}
}
```
The content of a model's `schema` is an key-value `{Object}` with the bellow characteristics:

 - Key
	 - Valid field of the model
	 - Non-existing field if the key's `pair` has `copy` property set to `true`
 - Value `{Object}`
	 - copy
		 - Paired key is not a valid model field, and the content is going to be taken from `from` field
	 - from
		 - It is the field where the content will be taken from and is required if `copy` is set to `true`.
	 - field
		 - {String} - It is the field that determines which field will be retrieve for associations (`model`and `collection`)
		 - {Function} - It is an asynchronous function to be called upon assignment process which receives as parameter [current record], [Model's name] and [callback function]

## NPM Info:
[![NPM](https://nodei.co/npm/sails-hook-solr.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sails-hook-solr/)

## Links
> * Sails http://sailsjs.org/
> * Solr http://lucene.apache.org/solr/
> * solr-node-client  http://lbdremy.github.io/solr-node-client/

## Copyright and license
Copyright 2014 - 2015 Sávio Lucena <saviogl@gmail.com> and contributors , under [the MIT license](LICENSE).