function Ball (options) {
	extend(this, options)
}

Ball.prototype = {
	body: null,
	fixture: null,
	owner: null,

	x: 0,
	y: 0,
	r: 1,
	a: 0,

	create: function (world, bodyDef, fixDef) {
		bodyDef.position.x = this.x
		bodyDef.position.y = this.y

		fixDef.shape = new b2CircleShape()
		fixDef.shape.SetRadius(this.r)

		bodyDef.userData = this

		this.body = world.CreateBody(bodyDef)
		this.fixture = this.body.CreateFixture(fixDef)

		return this
	},

	draw: function (ctx, c) {
		ctx.save()

		ctx.translate(this.x, this.y)

		ctx.beginPath()
		ctx.arc(0, 0, this.r, 0, 2 * Math.PI)
		ctx.fill()

		ctx.restore()
	}
}

function Box (options) {
	extend(this, options)
}

Box.prototype = {
	body: null,
	fixture: null,
	owner: null,

	x: 0,
	y: 0,
	w: 1,
	h: 1,
	a: 0,

	create: function (world, bodyDef, fixDef) {
		bodyDef.position.x = this.x
		bodyDef.position.y = this.y
		bodyDef.angle = this.a

		fixDef.shape = new b2PolygonShape()
		fixDef.shape.SetAsBox(this.w / 2, this.h / 2)

		bodyDef.userData = this

		this.body = world.CreateBody(bodyDef)
		this.fixture = this.body.CreateFixture(fixDef)

		return this
	},

	draw: function (ctx, c) {
		ctx.save()

		ctx.translate(this.x, this.y)
		ctx.rotate(this.a)

		ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h)

		ctx.restore()
	}
}
