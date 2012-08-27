var sounds

void function () {

var loader = new html5Preloader(
	'music0*:../evosounds/music0.ogg||../evosounds/music0.mp3',
	'music1*:../evosounds/music1.ogg||../evosounds/music1.mp3',
	'dudedie*:../evosounds/dudedie.ogg||../evosounds/dudedie.mp3',
	'gameover*:../evosounds/gameover.ogg||../evosounds/gameover.mp3',
	'victory*:../evosounds/victory.ogg||../evosounds/victory.mp3',
	'water*:../evosounds/water.ogg||../evosounds/water.mp3'
)

sounds = EventEmitter.create({
	ready: false,

	play: function (name) {
		var sound = this.get(name)

		if (!sound) return

		var instance

		if (sound.cloneNode) {
			instance = sound.cloneNode()
			instance.play()
		} else {
			instance = document.createElement('audio')
			instance.onload = function () {
				instance.onload = null
				instance.play()
			}

			instance.load()
		}

		return instance
	},

	get: function (name) {
		if (!this.ready) return null

		return loader.getFile(name)
	}
})

loader.on('finish', function () {
	sounds.ready = true

	sounds.get('music0').onended = function () {
		sounds.get('music1').play()
	}

	sounds.get('music1').onended = function () {
		sounds.get('music0').play()
	}

	sounds.get('music0').play()

	sounds.emit('ready', [])
})

}()
