const Executable = require('../Executable');

const setSecret = Symbol.for('setSecret');

function shadow(target, keys = []) {
	keys.forEach(function (key) {
		return Object.defineProperty(target, key, {
			configurable: false,
			get() {
				throw new Error('Restricted key: ' + key);
			}
		});
	});

	return target;
}

module.exports = (Class) =>
	(keys = []) =>
		(secret = '') =>
			function () {

				const handler = function (secretGuess) {
					if (secret === secretGuess) {
						return this;
					} else {
						throw new Error('Invalid secret: ', secretGuess);
					}
				};

				const instance = new (new Executable(Class, handler))(...arguments);

				Object.defineProperty(instance, setSecret, {
					configurable: false,
					value: (secretGuess, secretNew) => {
						if (secret === secretGuess) {
							return secret = secretNew;
						} else {
							throw new Error('Invalid secret: ', secretGuess);
						}
					}
				});

				return shadow(instance, keys);
			};

module.exports.setSecret = setSecret;
