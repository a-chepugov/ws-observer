const expect = require('chai').expect;
const testee = require('./index');

class A {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	getA() {
		return this.a;
	}
}

class B {
	constructor(d, e, f) {
		this.d = d;
		this.e = e;
		this.f = f;
	}

	getD() {
		return this.d;
	}
}

describe('Extended', () => {

	it('constructor', () => {
		const instance = new testee(new A(1, 2, 3), new B(4, 5, 6));

		expect(instance.a).to.be.equal(1);
		expect(instance.b).to.be.equal(2);
		expect(instance.c).to.be.equal(3);
		expect(instance.c).to.be.equal(3);
		expect(instance.getA).to.be.instanceOf(Function);

		expect(instance.d).to.be.equal(4);
		expect(instance.e).to.be.equal(5);
		expect(instance.f).to.be.equal(6);
		expect(instance.getD).to.be.undefined;
	});

});
