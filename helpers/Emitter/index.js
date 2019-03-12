const Observer = require('./Observer');

module.exports = class Emitter {
	constructor() {
		this.storage = new Map();
	}

	event(event) {
		if (this.storage.has(event)) {
			return this.storage.get(event);
		} else {
			const _event = new Observer();
			this.storage.set(event, _event);
			return _event;
		}
	}

	on(event, handler) {
		const _event = this.event(event);
		_event.attach(handler);
	}

	off(event, handler) {
		const _event = this.event(event);
		_event.detach(handler);
		if (_event.size === 0) {
			this.storage.delete(_event);
		}
	}

	once(event, handler) {
		const _this = this;
		const wrapper = function () {
			_this.off(event, wrapper);
			return handler.apply(this, arguments);
		};

		this.on(event, wrapper);
	}

	emit(event) {
		const _event = this.event(event);
		return function () {
			return _event.notify.apply(event, arguments);
		}
	}

	size(event) {
		return this.event(event).size;
	}
};
