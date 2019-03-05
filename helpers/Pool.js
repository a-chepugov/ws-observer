const Store = require('./Store');

module.exports = class Pool extends Store {
	constructor(limit = Infinity, hasher = () => Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER)) {
		super(limit);
		this.store = new Map();
		this.limit = limit;
		this.hasher = hasher;
	}

	set(key, value) {
		if (this.size < this.limit) {
			return this.store.set(key, value);
		} else {
			throw new Error('Pool is full');
		}
	}

	key() {
		return this.hasher.apply(this, arguments);
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

	del(key) {
		return this.store.delete(key);
	}

	get(key) {
		return this.store.get(key);
	}

	has(key) {
		return this.store.has(key);
	}

	get size() {
		return this.store.size;
	}

	get limit() {
		return this._limit;
	}

	set limit(value) {
		return this._limit = value;
	}

	get hasher() {
		return this._hasher;
	}

	set hasher(value) {
		return this._hasher = value;
	}
};
