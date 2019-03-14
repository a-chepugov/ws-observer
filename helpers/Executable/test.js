const expect = require('chai').expect;
const testee = require('./index');

class A {
	constructor() {
		this.store = new Map();
	}

	set(key, value) {
		return this.store.set(key, value);
	}

	get(key) {
		return this.store.get(key);
	}

	del(key) {
		return this.store.delete(key);
	}

	get size() {
		return this.store.size;
	}
}

describe('Executable', () => {

	it('own', () => {
		const handler = (a, b, c) => a + b + c;

		const Wrapped = testee(A, handler);
		const instance = Wrapped();
		expect(instance(1, 2, 3)).to.be.equal(6);
	});

	it('inherit', () => {
		const handler = (a, b, c) => a + b + c;

		const Wrapped = testee(A, handler);
		const instance = Wrapped();
		expect(instance.size).to.be.equal(0);
		instance.set(1, 2);
		expect(instance.size).to.be.equal(1);
		expect(instance.get(1)).to.be.equal(2);
	});

	it('prototype', () => {
		const handler = (a, b, c) => a + b + c;

		const Wrapped = testee(A, handler);
		const instance = Wrapped();
		expect(instance).to.be.instanceOf(A);
	});

	it('execute result prototype', () => {
		const handler = function () {
			return this;
		};

		const Wrapped = testee(A, handler);
		const instance = Wrapped();
		expect(A.prototype.isPrototypeOf(instance())).to.be.equal(true);
	});

});
