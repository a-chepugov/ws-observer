module.exports = class Store {
	constructor() {
		this.store = new Map();
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
		return this.store.clear();
	}

	apply(fn) {
		const entries = this.entries;
		return function () {
			return (Array.from(entries)).map(([key, value]) => fn.bind(this, key, value).apply(this, arguments));
		}.bind(this);
	}
};
