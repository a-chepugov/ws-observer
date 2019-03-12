const expect = require('chai').expect;
const testee = require('./index');

describe('Emitter', () => {

	it('new', () => {
		const emitter = new testee();
	});

	it('on', () => {
		const emitter = new testee();
		const event = 'event';

		let i = 0;
		const handler = function (a, b, c) {
			expect(a).to.equal(1);
			expect(b).to.equal(2);
			expect(c).to.equal(3);
			i++;
		};

		emitter.on(event, handler);
		emitter.emit(event)(1, 2, 3);

		expect(i).to.equal(1);

		emitter.emit(event)(1, 2, 3);
		expect(i).to.equal(2);
	});

	it('once', () => {
		const emitter = new testee();

		const event = 'event';
		const event2 = 'event2';

		let i = 0;
		const handler = function () {
			i++;
		};

		emitter.once(event, handler);
		expect(emitter.size(event)).to.equal(1);
		emitter.emit(event)();
		expect(emitter.size(event)).to.equal(0);
		expect(i).to.equal(1);

		emitter.emit(event)();
		expect(i).to.equal(1);
	});

	it('off', () => {
		const emitter = new testee();
		const event = 'event';

		let i = 0;
		const handler = function () {
			i++;
		};

		emitter.on(event, handler);
		expect(emitter.size(event)).to.equal(1);
		emitter.off(event, handler);
		expect(emitter.size(event)).to.equal(0);

		emitter.emit(event)();
		expect(i).to.equal(0);
	});

	it('this', () => {
		const emitter = new testee();

		const event = {a: 1};

		const handler = function () {
			expect(this).to.equal(event);
		};

		emitter.on(event, handler);

		emitter.emit(event)(1, 2, 3);
	});

});
