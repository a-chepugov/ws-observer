module.exports = function (Cls, decorator = (target) => target) {
	return class {
		constructor() {
			Object.setPrototypeOf(this, new (Function.prototype.bind.apply(Cls, Array.prototype.concat.call(Array, Array.prototype.slice.call(arguments)))));
			decorator(this);
		}
	};
};
