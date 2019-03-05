module.exports = class Store {
	constructor(limit = Infinity) {
		this.store = new Map();
		this.limit = limit;
	}

	get entries() {
		return this.store.entries();
	}

	get values() {
		return this.store.values();
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

	get(key) {
		return this.store.get(key);
	}

	set(key, value) {
		return this.store.set(key, value);
	}

	has(key) {
		return this.store.has(key);
	}

	del(key) {
		return this.store.delete(key);
	}

	clear() {
		return this.store.clear()
	}

	execute(fn) {
		return function () {
			return (Array.from(this.entries)).map(([key, value]) => fn.bind(this, key, value).apply(this, arguments));
		}.bind(this);
	}
};
