const config = require('config');
const http = require('http');
const port = config.port;
const host = config.host;

const server = http
	.createServer(require('./routes/static'))
	.listen(port, host, () => console.info(`${(new Date()).toISOString()}: Server is listening on http://${host}:${port}`));

const ws = require('./routes/ws')(server);
