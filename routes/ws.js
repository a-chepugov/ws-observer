const Pool = require('../helpers/Pool');
const Emitter = require('../helpers/Emitter');
const Guarded = require('../helpers/Guarded');
const Extended = require('../helpers/Extended');
const WebSocketServer = require('websocket').server;

module.exports = (server) => {

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

	const sendFactory = (type) => (connection) => (payload, error) => {
		console.log('DEBUG:ws.js():16 =>', connection.id, type);
		return connection.sendUTF(JSON.stringify({type, payload, error: error ? error.toString() : undefined}))
	};

	function onMessage(connection, msg) {
		const message = JSON.parse(convertMessage(msg));
		try {
			hub.emit(message.type)(message, connection);
		} catch (error) {
			console.error(error);
		}
	}

	class ExtendedMeta extends Extended {
		constructor(prototype, assign) {
			super(prototype, assign);
			Object.defineProperty(this, 'meta', {
				configurable: false,
				get: () => this.private.meta
			})
		}
	}

	const createRoomInstance = Guarded(ExtendedMeta)(['private', 'get', 'set', 'del', 'values', 'entries', 'connection']);
	const createConnectionInstance = Guarded(ExtendedMeta)(['private']);

	const hub = new Extended(new Emitter(), {storage: {rooms: new Pool(), connections: new Pool()}});

	hub
		.on('?connection', function (connection, message) {
			const {id, secret} = message;
			try {
				this.storage.connections.set(message.id, connection);
				sendFactory('!connection')(connection)(message);
			} catch (error) {
				sendFactory('!connection')(connection)(message, error);
			}
		}.bind(hub))

		.on('?connection.meta', function (message, connection) {
			try {
				const connectionUnwrapped = connection(message.payload.connection.secret);
				connectionUnwrapped.private.meta = message.payload.meta;
				sendFactory('!connection.meta')(connection)(connectionUnwrapped.meta);
			} catch (error) {
				sendFactory('!connection.meta')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.exist', function (message, connection, cb) {
			try {
				const exist = this.storage.rooms.has(message.payload.room.id);
				sendFactory('!room.exist')(connection)(exist);
			} catch (error) {
				sendFactory('!room.exist')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.create', function (message, connection) {
			try {
				const room = createRoom(message.payload.room, this.storage.rooms, connection);
				sendFactory('!room.create')(connection)(room(message.payload.room.secret));
			} catch (error) {
				sendFactory('!room.create')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.enter', function (message, connection) {
			try {
				const {payload: {room: {id, secret}}} = message;
				const room = this.storage.rooms.get(id);
				room(secret)
					.apply((k, v, payload) =>
						connection !== v ?
							sendFactory('!room.newcomer')(v)({id: payload.id, meta: payload.meta}) :
							undefined
					)(connection);

				const result = enterRoom(room, message.payload, connection);
				sendFactory('!room.enter')(connection)(result);
			} catch (error) {
				sendFactory('!room.enter')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.message', function (message, connection) {
			try {
				const {payload: {room: {id, secret}, roomate}} = message;
				const roomUnwrapped = this.storage.rooms.get(id)(secret);
				const connectionUnwrapped = connection(message.payload.connection.secret);
				if (connectionUnwrapped.id === message.payload.connection.id) {
					const ConnectionRoomate = roomUnwrapped.get(roomate.id);
					sendFactory('!room.message')(ConnectionRoomate)({
						message: message.payload.message,
						roomate: {id: connection.id}
					});
				} else {
					throw new Error('Invalid connection id: ' + message.payload.connection.id)
				}
			} catch (error) {
				sendFactory('!room.message')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.broadcast', function (message, connection) {
			try {
				const {payload: {room: {id, secret}}} = message;
				const room = this.storage.rooms.get(id);
				return room(secret)
					.apply((k, v, payload) =>
						connection !== v ?
							sendFactory('!room.broadcast')(v)(payload) :
							undefined
					)(message);
			} catch (error) {
				sendFactory('!room.broadcast')(connection)(message, error);
			}
		}.bind(hub))

		.on('?room.roomers', function (message, connection) {
			try {
				const {payload: {room: {id, secret}}} = message;
				const room = this.storage.rooms.get(id);
				let roomers = Array.from(room(secret).values).filter((item) => item !== connection).map(({id, meta}) => ({id, meta}));
				sendFactory('!room.roomers')(connection)(roomers);
			} catch (error) {
				sendFactory('!room.roomers')(connection)(message, error);
			}
		}.bind(hub));

	function createRoom({id, secret} = {}, rooms, connection) {
		if (id && !rooms.has(id)) {
			const room = createRoomInstance(secret)(new Pool(), {id, private: {creator: connection, connections: new Pool()}});
			rooms.set(id, room);
			return room;
		} else {
			throw new Error('Room is already created:' + id);
		}
	}

	function enterRoom(room, payload, connection) {
		if (room) {
			const roomUnwrapped = room(payload.room.secret);
			if (roomUnwrapped.has(payload.connection.id)) {
				return true;
			} else {
				const connectionUnwrapped = connection(payload.connection.secret);
				connectionUnwrapped.private.rooms.set(payload.room.id, room);
				connectionUnwrapped.private.roomsSecrets.set(payload.room.id, payload.room.secret);
				roomUnwrapped.set(connection.id, connection);
				return true;
			}
		} else {
			throw new Error('Room is not a: ' + payload.room.id)
		}
	}

	function leaveRoom(room, roomSecret, connection, connectionSecret) {
		if (room.id) {
			const roomUnwrapped = room(roomSecret);
			roomUnwrapped.del(connection.id);
			connection(connectionSecret).private.rooms.del(room.id);

			roomUnwrapped
				.apply((k, v, payload) =>
					payload !== v ?
						sendFactory('!room.leaving')(v)({id: payload.id, meta: payload.meta}) :
						undefined
				)(connection);
			return true;
		} else {
			throw new Error('Invalid room id: ' + room.id)
		}
	}

	const wsServer = new WebSocketServer({httpServer: server});

	wsServer.on('request', function (request) {
		const connection = request.accept('', request.origin);

		const secret = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		const id = connection.id ? connection.id : Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

		const connectionGuarded = createConnectionInstance(secret)(connection, {id, private: {rooms: new Pool(), roomsSecrets: new Pool()}});

		connection.on('message', onMessage.bind(this, connectionGuarded));

		connection.on('close', () => {

			hub.storage.connections.del(id);
			const connectionUnwrapped = connectionGuarded(secret);

			Array.from(connectionUnwrapped.private.rooms.values).forEach((item) => {
				const roomSecret = connectionUnwrapped.private.roomsSecrets.get(item.id);
				leaveRoom(item, roomSecret, connectionGuarded, secret);
			});

		});

		return hub.emit('?connection')(connectionGuarded, {id, secret});
	});

	return wsServer;
};
