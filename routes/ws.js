module.exports = (server) => {
	const WebSocketServer = require('websocket').server;
	const Observer = require('../helpers/Observer');

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

		const messageHandler = (message, source) => {
			if (source !== connection) {
				switch (message.type) {
					case 'utf8':
						return connection.sendUTF(message.utf8Data);
					case 'binary':
						return connection.sendBytes(message.binaryData);
					default:
						return console.error('Unknown message type');
				}
			}
		};

		namespace.attach(connection, messageHandler);
		connection.on('message', (message) => namespace.notify(message, connection));

		connection.on('close', () => {
			namespace.detach(connection);
			if (namespace.size === 0) {
				namespaces.delete(name);
			}
		});
	});

	return wsServer;
};

