class Item {
	constructor(payload) {
		this.timestamp = Date.now();
		this.payload = payload;
	}

	clone() {
		return Item.from(this);
	}

	static from(connection) {
		return Object.assign(Object.create(Item.prototype), connection);
	}
}

module.exports = Item;
