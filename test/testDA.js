var assert = require('chai').assert;
var DA = require('../lib/deviantart');
var debug = require('debug')('dominant-colour');


describe('Deviant Art', function() {
    describe('getGallery', function() {
	it('should get the users gallery', function() {
	    var da = new DA({
		clientID: process.env.DA_CLIENT_ID,
		clientSecret: process.env.DA_CLIENT_SECRET
	    });
	    return da.getClientAccessToken()
		.then(function() {
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
	});
    });
})


