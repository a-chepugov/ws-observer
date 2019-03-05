const config = require('config');
const http = require('http');
const port = config.port;

const server = http
	.createServer(require('./routes/static'))
	.listen(port, () => console.info(`${(new Date()).toISOString()}: Server is listening on port ${port}`));

const ws = require('./routes/ws')(server);
