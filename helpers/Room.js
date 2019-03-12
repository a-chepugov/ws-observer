const Pool = require('./Pool');

module.exports = class Room extends Pool {
	constructor(secret = '') {
		super();
		this.secret = secret;
	}

	get secret() {
		return this._secret;
	}

	set secret(value) {
		return this._secret = value;
	}

	authorize(secret = '') {
		return secret === this.secret ? true : (() => {
			throw new Error('Invalid secret: ' + secret)
		})();
	}

	enter(key, value, secret = '') {
		if (this.has(key)) {
			throw new Error('Key is in use: ' + key)
		} else {
			return this.set(key, value, secret);
		}
	}

	set(key, value, secret = '') {
		return this.authorize(secret) ?
			super.set(key, value) :
			false
	}

	apply(fn, secret = '') {
		return this.authorize(secret) ?
			super.apply(fn) :
			false
	}
};

