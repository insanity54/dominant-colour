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

    return daRequest()(reqOpts);
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
