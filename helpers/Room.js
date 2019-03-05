const Store = require('./Store');

module.exports = class Room extends Store {
	constructor(id = 0, {secret = '', limit} = {}) {
		super(limit);
		this.id = id;
		this.timestamp = Date.now();
		this.secret = secret;
	}

	get secret() {
		return this._secret;
	}

	set secret(value) {
		return this._secret = value;
	}

	set(key, member, secret = '') {
		if (secret === this.secret) {
			if (this.has(key)) {
				throw new Error('Key is in use:' + key)
			} else {
				return this.store.set(key, member);
			}
		} else {
			throw new Error('Invalid secret');
		}
	}

	add(value) {
		const key = this.key.apply(this, arguments);
		if (this.has(key)) {
			throw new Error('Key is in use:' + key)
		} else {
			this.set(key, value);
		}
		return key;
	}
};
