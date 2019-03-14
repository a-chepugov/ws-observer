const expect = require('chai').expect;
const testee = require('./index');
const setSecret = require('./index').setSecret;

class A {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.store = new Map();
	}

	set(key, value) {
		return this.store.set(key, value);
	}

	get(key) {
		return this.store.get(key);
	}

	has(key) {
		return this.store.has(key);
	}

	del(key) {
		return this.store.delete(key);
	}

	get size() {
		return this.store.size;
	}

	get entries() {
		return this.store.entries();
	}

	execute(fn) {
		const entries = this.entries;
		return function () {
			return (Array.from(entries))
				.map(([key, value]) => fn.bind(this, key, value).apply(this, arguments));
		};
	}

}

describe('Guarded', () => {

	it('constructor', () => {
		const secret = 'secret';
		const instance = testee(A)([])(secret)(1, 2, 3);

		expect(instance.a).to.be.equal(1);
		expect(instance.b).to.be.equal(2);
		expect(instance.c).to.be.equal(3);
	});

	it('access. not restricted', () => {
		const secret = 'secret';
		const instance = testee(A)(['b', 'set', 'execute'])(secret)(1, 2, 3);

		expect(instance.a).to.be.equal(1);
		expect(instance.has(1)).to.be.equal(false);
		expect(instance.size).to.be.equal(0);
	});

	it('access. restricted', () => {
		const secret = 'secret';
		const instance = testee(A)(['b', 'set', 'execute'])(secret)(1, 2, 3);

		expect(() => instance.b).to.throw();
		expect(() => instance.set()).to.throw();
		expect(() => instance.execute()).to.throw();

		expect(instance(secret).b).to.be.equal(2);
		instance(secret).set(1, 'one');

		let i = 0;
		const fn = (k, v, a, b, c) => i += a + b + c;

		instance(secret).execute(fn)(1, 2, 3);
		expect(i).to.be.equal(6);

		instance(secret).set(2, 'two');
		instance(secret).execute(fn)(1, 2, 3);
		expect(i).to.be.equal(18);
	});

	it('secret', () => {
		const secret = 'secret';
		const instance = testee(A)(['a'])(secret)(123);

		expect(() => instance.a).to.throw();

		const secret2 = 'secret2';

		expect(() => instance[setSecret](secret2, secret2)).to.throw();

		instance[setSecret](secret, secret2);
		expect(instance(secret2).a).to.be.equal(123);
	});

});
