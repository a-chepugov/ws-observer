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

	const rooms = new Room(undefined, (value, name) => name);
	const connections = new Pool(undefined, (value, name) => name);

	const wsServer = new WebSocketServer({httpServer: server});

	function send(payload) {
		return this.sendUTF(JSON.stringify(payload))
	}

	wsServer.on('request', function (request) {
		const connection = request.accept('', request.origin);
		connection.id = connection.id ? connection.id : Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);

		function createRoom({id, secret}) {
			try {
				const room = new Room(secret);
				rooms.set(id, room);
				return true;
			} catch (error) {
				return error.toString();
			}
		}

		function enterRoom({id, secret} = {}) {
			try {
				const room = rooms.get(id);
				room.enter(connection.id, connection, secret);
				return true;
			} catch (error) {
				return error.toString();
			}
		}

		function messageHandler(message) {
			switch (message.type) {
				case '?room.exist': {
					return send.call(connection, {type: '!room.exist', payload: rooms.has(message.payload.room.id)});
				}
				case '?room.create': {
					return send.call(connection, {type: '!room.create', payload: createRoom(message.payload.room)});
				}
				case '?room.enter': {
					return send.call(connection, {type: '!room.enter', payload: enterRoom(message.payload.room)});
				}
				case '?room.broadcast': {
					const room = rooms.get(message.payload.room.id);
					return room.apply((k, v, payload) => send.call(v, {type: '!room.broadcast', payload}), message.payload.room.secret)(message.payload.message);
				}
				default:
					throw new Error(`Unknown type: ${message.type}`);
			}
		}

		connection.on('message', (message) => messageHandler(JSON.parse(convertMessage(message))));

		connection.on('close', () => {
			// удаляем из комнаты и, возможно из пула
		});

		return send.call(connection, {type: '!connect', payload: {id: connection.id}});
	});

	return wsServer;
};

const Room = require('../helpers/Room');

function decorate(Class, decorator) {
	let q = Object.getOwnPropertyNames(Class.prototype);
	console.log('DEBUG:ws.js(decorator):87 =>');
	console.dir(q, {colors: true, depth: null});
	console.log('DEBUG:ws.js(decorator):89 =>');
	decorator(Class)

	return decorator(Class);
}

function decorator(Class) {
	console.log('DEBUG:ws.js(decorator):94 =>', Class);
	return function (...args) {
		console.log('DEBUG:ws.js():95 =>', ...args);
	}
}

const RoomDecorated = decorate(Room, decorator);
console.log('DEBUG:ws.js():97 =>');
console.dir(RoomDecorated, {colors: true, depth: null});
console.log('DEBUG:ws.js():102 =>');

// console.log('DEBUG:ws.js():105 =====================>');
// const roomDecorated = new RoomDecorated(1, 2, 3, 4);
// console.log('DEBUG:ws.js(,):107 =>');
// console.dir(roomDecorated, {colors: true, depth: null});
