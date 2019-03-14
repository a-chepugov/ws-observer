module.exports.class = function (Class, decorator = (target) => target) {
	return class {
		constructor() {
			Object.setPrototypeOf(this, new (Function.prototype.bind.apply(Class, Array.prototype.concat.call(Array, Array.prototype.slice.call(arguments)))));
			decorator(this);
		}
	};
};
