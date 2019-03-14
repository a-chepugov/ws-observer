module.exports = class {
	constructor(prototype, assign) {
		Object.setPrototypeOf(this, prototype);
		Object.assign(this, assign);
	}
};
