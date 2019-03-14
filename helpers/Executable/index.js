module.exports = function (Class, handler) {
	return function constructor() {
		const instance = new (Function.prototype.bind.apply(Class, Array.prototype.concat.call(Class, Array.prototype.slice.call(arguments))));
		const wrapper = function () {
			return handler.apply(this, arguments);
		}.bind(instance);

		Object.setPrototypeOf(wrapper, instance);
		return wrapper;
	};
};
