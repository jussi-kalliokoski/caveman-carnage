function TextOverlay (options) {
}

TextOverlay.prototype = {
	callback: null,
	outroCallback: null,

	textColor: '#ffffff',
	textFont: 'IM Fell English',
	textFade: 1,
	textHold: 6,
	text: '',

	time: 0,
	overlayColor: '#000000',
	overlayFade: 1.5,

	active: false,

	draw: function (ctx, c, delta) {
		if (!this.active) return

		this.time += delta

		var outroTime = this.overlayFade + this.textFade + this.textHold

		var phase = this.time > this.overlayFade + outroTime ?
			'over' : this.time > outroTime ? 'outro' :
			this.time > this.overlayFade + this.textFade ?
			'hold' : this.time > this.overlayFade ? 'text' :
			'intro'

		if (
			phase === 'over'
		) {
			var cb = this.callback

			if (cb) setTimeout(cb, 0)

			this.active = false

			return
		} else if (phase === 'outro' && this.outroCallback) {
			setTimeout(this.outroCallback, 0)

			this.outroCallback = null
		}

		var alpha, textAlpha

		switch (phase) {
		case 'outro':
			alpha = textAlpha = 1.0 - (this.time - outroTime) /
				this.overlayFade
			break
		case 'hold':
			alpha = textAlpha = 1.0
			break
		case 'text':
			alpha = 1.0
			textAlpha = (this.time - this.overlayFade) /
				this.textFade
			break
		case 'intro':
			alpha = this.time / this.overlayFade
			textAlpha = 0.0
		}

		alpha = Math.sin(alpha * Math.PI / 2)
		textAlpha = Math.sin(textAlpha * Math.PI / 2)

		ctx.save()

		ctx.fillStyle = this.overlayColor
		ctx.globalAlpha = alpha

		ctx.fillRect(0, 0, c.width, c.height)

		ctx.fillStyle = this.textColor
		ctx.font = this.textFont
		ctx.globalAlpha = textAlpha

		TextOverlay.multilineText(ctx, this.text,
			c.width, c.height, this.textFont)

		ctx.restore()
	},

	show: function (text, callback, outroCallback) {
		this.callback = callback
		this.outroCallback = outroCallback
		this.text = text
		this.time = 0
		this.active = true
	}
}

TextOverlay.multilineText = function (ctx, str, width, height, font) {
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	str = str.split('\n');
	width = width / 2;
	height = height / 2;

	var lineCount = str.length
	var lineHeight = height / lineCount
	var middleLine = lineCount / 2

	var longestLine = 0
	var i

	for (i=0; i<lineCount; i++) {
		longestLine = Math.max(longestLine, str[i].length)
	}

	/* it's an approximate of a sort... */
	var fontSize = Math.min(lineHeight, width / longestLine * 3)

	ctx.font = ~~(fontSize - 2) + 'px "' + font + '"';

	for (i=0; i<lineCount; i++) {
		ctx.fillText(str[i], width, height + (i - middleLine) * lineHeight);
	}
}
