const Store = require('./Store');

module.exports = class extends Store {
	constructor(limit = Infinity) {
		super();
		this.limit = limit;
	}

	get limit() {
		return this._limit;
	}

	set limit(value) {
		return this._limit = value;
	}

	set(key, value) {
		if (this.size < this.limit) {
			return this.store.set(key, value);
		} else {
			throw new Error('Pool is full');
		}
	}

};
