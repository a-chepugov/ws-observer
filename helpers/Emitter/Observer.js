module.exports = class {
	constructor() {
		const storage = new Set();
		this.storage = storage;

		this.notify = function () {
			return (Array.from(storage)).map((value) => value.apply(this, arguments))
		}
	}

	attach(value) {
		return this.storage.add(value)
	}

	detach(value) {
		return this.storage.delete(value)
	}

	clear() {
		return this.storage.clear();
	}

	get values() {
		return this.storage.values();
	}

	get size() {
		return this.storage.size;
	}
};
