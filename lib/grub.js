// image aquisition & processing functions

var rp = require('request-promise');


module.exports.downloadImage = function downloadImage(url) {
    dlOpts = {
	'uri': url
    };
    return rp.get(dlOpts)
}



module.exports.analyze = function analyze(imageData) {
    
}
