const config = require('config');
const http = require('http');
const WebSocketServer = require('websocket').server;
const Observer = require('./helpers/Observer');

const port = config.port;

const server = http
	.createServer()
	.listen(port, () => console.info(`${new Date()}: Server is listening on port ${port}`));

const namespaces = new Map();

function getNamespace(name) {
	if (namespaces.has(name)) {
		return namespaces.get(name);
	} else {
		const namespace = new Observer();
		namespaces.set(name, namespace);
		return namespace;
	}
}

const wsServer = new WebSocketServer({httpServer: server});

wsServer.on('request', function (request) {
	const connection = request.accept('', request.origin);
	const name = request.resource;

	const namespace = getNamespace(name);

	const messageHandler = (message) => {
		switch (message.type) {
			case 'utf8':
				return connection.sendUTF(message.utf8Data);
			case 'binary':
				return connection.sendBytes(message.binaryData);
			default:
				return console.error('Unknown message type');
		}
	};

	namespace.attach(connection, messageHandler);
	connection.on('message', (message) => namespace.notify(message));

	connection.on('close', () => {
		namespace.detach(connection);
		if (namespace.size === 0) {
			namespaces.delete(name);
		}
	});
});
