const config = require('config');
const serve = require('serve-static')(config.static);
module.exports = (request, response) => serve(request, response, new Function());
