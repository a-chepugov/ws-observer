module.exports = (server) => {
	const WebSocketServer = require('websocket').server;

	function convertMessage(message) {
		switch (message.type) {
			case 'utf8':
				return message.utf8Data;
			case 'binary':
				return message.binaryData.toString('utf8');
			default:
				throw new Error('Unknown message type');
		}
	}

	const Pool = require('../helpers/Pool');
	const Room = require('../helpers/Room');

	const pool = new Pool(undefined, (value, name) => name);

	const wsServer = new WebSocketServer({httpServer: server});

	function send(payload) {
		return this.sendUTF(JSON.stringify(payload))
	}

	wsServer.on('request', function (request) {
		const connection = request.accept('', request.origin);
		const {pathname: id} = request.resourceURL;

		function onCreateRequest({secret} = {}) {
			if (pool.has(id)) {
				throw new Error('Room already exist');
			} else {
				const room = new Room(id, {secret});
				pool.set(id, room);
				return room;
			}
		}

		function onEnterRequest({id, secret, connection: {id: connectionId} = {}} = {}, connection) {
			console.log('DEBUG:ws.js(onEnterRequest):41 =>', connectionId);
			const room = pool.get(id);
			room.set(connectionId, connection, secret);
			return room;
		}

		function messageHandler(message, connection) {
			switch (message.type) {
				case 'room.exist': {
					return send.call(connection, {type: 'room.exist', payload: pool.has(message.payload.id)});
				}
				case 'room.create': {
					const room = onCreateRequest(message.payload);
					return send.call(connection, {type: 'room.created', payload: {id: room.id, secret: room.secret},});
				}
				case 'room.enter': {
					const room = onEnterRequest(message.payload, connection);
					room.execute((k, v, payload) => send.call(v, {type: 'room.broadcasted', payload}))(1231234)

					return send.call(connection, {type: 'room.entered', payload: {id: room.id, secret: room.secret}});
				}
				case 'room.broadcast': {
					console.log('DEBUG:ws.js(messageHandler):58 =>', message);
					const room = pool.get(message.payload.id);
					return room.execute((k, v, payload) => send.call(v, {type: 'room.broadcasted', payload}))(message.payload.message);
				}
				default:
					throw new Error(`Unknown type: ${message.type}`);
			}
		}

		connection.on('message', (message) => messageHandler(JSON.parse(convertMessage(message)), connection));

		connection.on('close', () => {
			// удаляем из комнаты и, возможно из пула
		});

		return send.call(connection, {type: 'connected', payload: {id: Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER)}});
	});

	return wsServer;
};

