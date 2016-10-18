//var rp = require('request-promise');
var _ = require('lodash');
var assert = require('chai').assert;
var debug = require('debug')('dominant-colour');
var rp = require('request-promise');


var daRequest = function daRequest() {
    var jar = rp.jar();
    return rp.defaults({
	'baseUrl': 'https://www.deviantart.com/',
	'headers': {
	    'Origin': 'http://www.deviantart.com',
	    'User-Agent': 'infobot (chris@grimtech.net)'
	},
	'jar': jar,
	'json': true,
	'followRedirect': false
    });
}



var genericTransform = function genericTransform(body) {
    if (body.statusCode === 403) throw new Error('AUTHENTICATION');
    var json;
    try {
	json = JSON.parse(body);
	return json;
    }
    catch(e) {
	return body
    }
};


var DA = function DA(opts) {
    var defaultOpts = {}
    var options = _.defaults(opts, defaultOpts);


    this.clientSecret = options.clientSecret;
    this.clientID = options.clientID;
    this.artistName = options.artistName;
    this.accessToken = undefined;
    this.cookieJar = undefined;
};


DA.prototype.getClientAccessToken = function getClientAccessToken() {

    var self = this;


    debug('  - getting client access token');
    debug('    clientSecret=%s, clientID=%s, accessToken=%s', self.clientSecret, self.clientID, self.accessToken);
    

    var reqOpts = {
	method: 'POST',
	uri: '/oauth2/token',
	form: {
	    'grant_type': 'client_credentials',
	    'client_id': self.clientID,
	    'client_secret': self.clientSecret
	},
	transform: genericTransform
    };

    var def = daRequest();

    return def(reqOpts)
	.catch(function(err) {
	    debug('  - got an error while getting access token');
	    debug(err);
	})
	.then(function(body) {
	    debug('  - got body from getClientAccessToken');
	    assert.isObject(body);
	    assert.isNumber(body.expires_in);
	    assert.isString(body.access_token);
	    assert.equal(body.token_type, 'Bearer');
	    return self.accessToken = body.access_token;
	});
}


DA.prototype.getGallery = function getGallery(username) {
    var self = this;

    debug('  - getting gallery');
    debug(self.accessToken);

    assert.isString(username);
    assert.isString(self.clientSecret);
    assert.isString(self.clientID);
    assert.isString(self.accessToken);
    //assert.isDefined(self.cookieJar, 'no cookieJar exists on the DA instance')

    var reqOpts = {
	method: 'GET',
	uri: '/api/v1/oauth2/gallery/all',
	qs: {
	    'access_token': self.accessToken,
	    'username': username,  // offset and limit also available as params
	},
	jar: self.cookieJar,
	transform: genericTransform
    };

    var validateResponse = function validateResponse(response) {
	assert.isObject(response, 'did not get json back from gallery request');
	assert.isBoolean(response.has_more);
	assert.isArray(response.results);
	return response;
    };

    var getPage = function getPage(opts) {
	assert.isNumber(opts.offset, 'getPage was not passed required option offset');
	opts = _.defaults(opts, {'limit': 10});
	return daRequest().defaults(reqOpts)({qs: {'offset': opts.offset, 'limit': opts.limit}})
	    .then(function(response) {
		return validateResponse(response);
	    })
    }



    var processPage = function processPage(opts) {
	assert.isObject(opts, 'processPage did not receive options object');
	assert.isArray(deviationList, 'processPage can not access deviation list');
	opts = _.defaults(opts, {'offset': 0, 'limit': 10});
	var options = {
	    offset: opts.offset,
	    limit: opts.limit
	};
	return getPage(options)
	    .then(function(page) {
		
		debug('  - got page. has_more=%s, next_offset=%s', page.has_more, page.next_offset);
		_.each(page.results, function(o) {
		    deviationList.push(o);
		});
	
		if (page.has_more) {
		    debug('  - page offset=%s reported that there are more pages.', opts.offset);
		    return processPage({'offset': page.next_offset})
		}
		else {
		    debug('  - page offset=%s reported that there are NOT more pages.', opts.offset);
		    return deviationList;
		}
	    })
    }

    // get the first page
    // if there are more pages, get those pages too
    var deviationList = [];
    return processPage({'offset': 0});
}



DA.prototype.getHot = function getHot() {
    var reqOpts = {
	'uri': '/api/v1/oauth2/browse/hot',
	'method': 'GET',
	'headers': {

	},
	'qs': {
	    'access_token': self.accessToken
	}
    };
}


module.exports = DA;
