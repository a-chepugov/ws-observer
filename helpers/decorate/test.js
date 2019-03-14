const expect = require('chai').expect;
const testee = require('./index').class;

describe('decorate', () => {

	it('default', () => {
		class A {
			constructor(a, b, c) {
				this.a = a;
				this.b = b;
				this.c = c;
			}
		}

		const instance = new (testee(A))(1, 2, 3);
		expect(instance).to.be.instanceof(A);
		expect(instance.a).to.be.equal(1);
		expect(instance.b).to.be.equal(2);
		expect(instance.c).to.be.equal(3);
	});

	it('decorator. function', () => {
		class A {
			fn(a) {
				return a;
			}
		}

		let i = 0;
		let j = 0;

		function decorator(target) {
			i++;
			const fn = target.fn;

			target.fn = (a) => {
				j++;
				return fn(a);
			}
		};

		const instance = new (testee(A, decorator, ['fn']))(1, 2, 3);
		expect(instance.fn(42)).to.be.equal(42);
		expect(instance.fn(42)).to.be.equal(42);
		expect(instance.fn(42)).to.be.equal(42);
		expect(i).to.be.equal(1);
		expect(j).to.be.equal(3);
	});

	it('decorator. property', () => {
		class A {
			constructor(a, b, c) {
				this.a = a;
				this.b = b;
				this.c = c;
			}
		}

		function decorator(target) {
			target.a++;
			target.b++;
			target.c++;
		};

		const instance = new (testee(A, decorator, ['fn']))(1, 2, 3);
		expect(instance.a).to.be.equal(2);
		expect(instance.b).to.be.equal(3);
		expect(instance.c).to.be.equal(4);
	});

});
