/*jshint asi:true */
var EventEmitter = function () {

var defineProperty = Object.defineProperty

var defineValue = defineProperty ? function (obj, name, value) {
	defineProperty(obj, name, {
		value: value,
		writable: true,
		configurable: true
	})
} : function (obj, name, value) {
	obj[name] = value
}

/**
 * A class for managing objects that emit events.
 *
 * @class
*/
function EventEmitter () {}

EventEmitter.prototype = {
	_listeners: null,

/**
 * Emits an event.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Array} args The arguments to pass to the listeners.
 *
 * @return {Object} this context of the method call.
*/
	emit: function (name, args) {
		var listeners, i

		if (this._listeners[name]) {
			listeners = this._listeners[name].slice()

			for (i=0; i<listeners.length; i++) {
				listeners[i].apply(this, args)
			}
		}

		return this
	},

/**
 * Adds an event listener.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Function} listener The listener for the event.
 *
 * @return {Object} this context of the method call.
*/
	on: function (name, listener) {
		this._listeners[name] = this._listeners[name] || []
		this._listeners[name].push(listener)

		return this
	},

/**
 * Removes an event listener.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Function} !listener The listener to be removed. If not specified, removes all listeners on that event.
 *
 * @return {Object} this context of the method call.
*/
	off: function (name, listener) {
		if (this._listeners[name]) {
			if (!listener) {
				delete this._listeners[name]
				return this
			}

			for (var i=0; i<this._listeners[name].length; i++) {
				if (this._listeners[name][i] === listener) {
					this._listeners[name].splice(i--, 1)
				}
			}

			if (!this._listeners[name].length) {
				delete this._listeners[name]
			}
		}

		return this
	},

/**
 * Adds a one-shot event listener that gets removed after it has been called once.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Function} listener The listener for the event.
 *
 * @return {Object} this context of the method call.
*/
	once: function (name, listener) {
		return this.on(name, function l () {
			this.off(name, l)

			return listener.apply(this, arguments)
		})
	},

/**
 * Creates a callback function that redirects calls of the callback to an event.
 *
 method EventEmitter
 *
 * @arg {String} name The name of the event.
 *
 * @return {Function} The callback function.
*/
	proxy: function (name) {
		var self = this

		return function () {
			self.emit(name, arguments)
		}
	},

/**
 * Starts the EventEmitter service.
 *
 * @method EventEmitter
 *
 * @return {Object} this context of the method call.
*/
	initEvents: function () {
		defineValue(this, '_listeners', {})

		return this
	}
}

/**
 * Makes a specified existing object implement EventEmitter.
 *
 * @static EventEmitter
 * @name create
 *
 * @arg {Object} object The object to implement EventEmitter.
 *
 * @return {Object} The `object` argument.
*/

EventEmitter.create = function (object) {
	var k

	for (k in EventEmitter.prototype) {
		if (!EventEmitter.prototype.hasOwnProperty(k)) continue

		defineValue(object, k, EventEmitter.prototype[k])
	}

	object.initEvents()

	return object
}

return EventEmitter

}()
