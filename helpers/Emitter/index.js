const Observer = require('./Observer');

module.exports = class Emitter {
	constructor() {
		this.store = new Map();
	}

	event(event) {
		if (this.store.has(event)) {
			return this.store.get(event);
		} else {
			const _event = new Observer();
			this.store.set(event, _event);
			return _event;
		}
	}

	on(event, handler) {
		const _event = this.event(event);
		_event.attach(handler);
		return this;
	}

	off(event, handler) {
		const _event = this.event(event);
		_event.detach(handler);
		if (_event.size === 0) {
			this.store.delete(_event);
		}
		return this;
	}

	once(event, handler) {
		const _this = this;
		const wrapper = function () {
			_this.off(event, wrapper);
			return handler.apply(this, arguments);
		};

		this.on(event, wrapper);
		return this;
	}

	emit(event) {
		const _event = this.event(event);
		return function () {
			return _event.notify.apply(event, arguments);
		};
		return this;
	}

	size(event) {
		return this.event(event).size;
	}
};
