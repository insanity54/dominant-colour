var DA = require('./lib/deviantart');
var Promise = require('bluebird');
var debug = require('debug')('dominant-colour');
var assert = require('chai').assert;


var daClientSecret = process.env.DA_CLIENT_SECRET;
var daClientID = process.env.DA_CLIENT_ID;

assert.isDefined(daClientSecret);
assert.isDefined(daClientID);



var da = new DA({
    clientID: process.env.DA_CLIENT_ID,
    clientSecret: process.env.DA_CLIENT_SECRET
});

return da.getClientAccessToken()
    .then(function() {
	debug('  - got access token');
	debug(da.accessToken);
	return da.getGallery('tanatalus')
    })
    .then(function(gallery) {
	assert.isDefined(gallery);
	assert.isObject(gallery);
	debug('  - got gallery');
	debug(gallery);
    })
    .catch(function(err) {
	debug('  - got an error while getting gallery');
	debug(err);
	if (err === 'AUTH') throw err
    });








