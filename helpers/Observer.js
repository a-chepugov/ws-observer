module.exports = class {
	constructor() {
		this.storage = new Map();
	}

	attach(name, value) {
		return this.storage.set(name, value)
	}

	detach(name) {
		return this.storage.delete(name)
	}

	notify() {
		return (Array.from(this.entries)).map(([key, value]) => value.apply(key, arguments))
	}

	clear() {
		return this.storage.clear()
	}

	get values() {
		return this.storage.values();
	}

	get entries() {
		return this.storage.entries();
	}

	get size() {
		return this.storage.size;
	}
};
