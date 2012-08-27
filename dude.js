function Dude (options) {
	extend(this, options)

	var head = new Ball({
		x: this.x,
		y: this.y - this.h / 2,
		r: this.headRadius,
	})

	var body = new Box({
		x: this.x,
		y: this.y,
		h: this.h,
		w: this.w
	})

	var leftLeg = new Box({
		x: this.x - 6,
		y: this.y + 30,
		h: this.legLength,
		w: this.limbThickness,
		a: Math.PI * 0.187
	})
	var rightLeg = new Box({
		x: this.x + 6,
		y: this.y + 30,
		h: this.legLength,
		w: this.limbThickness,
		a: -Math.PI * 0.189
	})

	var leftArm = new Box({
		x: this.x - this.armLength / 2,
		y: this.y - this.h / 2 + this.shoulderHeight,
		h: this.limbThickness,
		w: this.armLength
		
	})
	var rightArm = new Box({
		x: this.x + this.armLength / 2,
		y: this.y - this.h / 2 + this.shoulderHeight,
		h: this.limbThickness,
		w: this.armLength
		
	})

	head.owner =
	body.owner =
	leftLeg.owner =
	rightLeg.owner =
	leftArm.owner =
	rightArm.owner =
		this

	extend(this, {
		head: head,
		body: body,
		leftLeg: leftLeg,
		rightLeg: rightLeg,
		leftArm: leftArm,
		rightArm: rightArm
	})

	this.initEvents()

	this.registerEvents()
}

Dude.prototype = extend(new EventEmitter(), {
	head: null,
	body: null,
	leftLeg: null,
	rightLeg: null,
	leftArm: null,
	rightArm: null,

	neck: null,
	leftGroin: null,
	rightGroin: null,
	leftShoulder: null,
	rightShoulder: null,

	health: 10.0,

	x: 0,
	y: 0,
	w: 7,
	h: 40,

	isAlpha: false,

	headRadius: 10,
	legLength: 25,
	armLength: 20,
	limbThickness: 7,
	shoulderHeight: 15,

	create: function (world, bodyDef, fixDef) {
		var head = this.head.create(world, bodyDef, fixDef)
		var body = this.body.create(world, bodyDef, fixDef)
		var leftLeg = this.leftLeg.create(world, bodyDef, fixDef)
		var rightLeg = this.rightLeg.create(world, bodyDef, fixDef)
		var leftArm = this.leftArm.create(world, bodyDef, fixDef)
		var rightArm = this.rightArm.create(world, bodyDef, fixDef)

		var neck = new b2RevoluteJointDef()
		neck.Initialize(head.body, body.body, head.body.GetWorldCenter())
		world.CreateJoint(neck)

		var groinPoint = extend({}, body.body.GetWorldCenter())
		groinPoint.y += body.h / 2

		var leftGroin = new b2RevoluteJointDef()
		leftGroin.Initialize(leftLeg.body, body.body, groinPoint)
		var rightGroin = new b2RevoluteJointDef()
		rightGroin.Initialize(rightLeg.body, body.body, groinPoint)

		var shoulderPoint = extend({}, body.body.GetWorldCenter())

		var leftShoulder = new b2RevoluteJointDef()
		leftShoulder.Initialize(leftArm.body, body.body, shoulderPoint)
		var rightShoulder = new b2RevoluteJointDef()
		rightShoulder.Initialize(rightArm.body, body.body, shoulderPoint)

		return extend(this, {
			world: world,

			neck: world.CreateJoint(neck),
			leftGroin: world.CreateJoint(leftGroin),
			rightGroin: world.CreateJoint(rightGroin),
			leftShoulder: world.CreateJoint(leftShoulder),
			rightShoulder: world.CreateJoint(rightShoulder)
		})
	},

	registerEvents: function () {
		var self = this

		this.on('receivedamage', this.onreceivedamage)

		this.on('die', this.ondie)
	},

	onreceivedamage: function (amount, damager) {
		var dead = this.health <= 0.0

		this.health -= amount

		if (!dead && this.health <= 0.0) {
			this.emit('die', [damager])
		}

		if (this.health < -1024.0 && this.neck) {
			this.world.DestroyJoint(this.neck)
			this.neck = null
		}
		if (this.health < -512.0 && this.leftShoulder) {
			this.world.DestroyJoint(this.leftShoulder)
			this.leftShoulder = null
		}
		if (this.health < -256.0 && this.rightShoulder) {
			this.world.DestroyJoint(this.rightShoulder)
			this.rightShoulder = null
		}
		if (this.health < -128.0 && this.leftGroin) {
			this.world.DestroyJoint(this.leftGroin)
			this.leftGroin = null
		}
		if (this.health < -64.0 && this.rightGroin) {
			this.world.DestroyJoint(this.rightGroin)
			this.rightGroin = null
		}
	},

	ondie: function (killer) {
		this.head.body.SetType(b2Body.b2_dynamicBody)
		this.body.body.SetType(b2Body.b2_dynamicBody)
		this.leftLeg.body.SetType(b2Body.b2_dynamicBody)
		this.rightLeg.body.SetType(b2Body.b2_dynamicBody)
		this.leftArm.body.SetType(b2Body.b2_dynamicBody)
		this.rightArm.body.SetType(b2Body.b2_dynamicBody)
	},

	draw: function (ctx, c) {
		ctx.save()

		if (this.isAlpha) ctx.fillStyle = 'blue'
		else if (this.health <= 0) ctx.fillStyle = 'red'

		this.head.draw(ctx, c)
		this.body.draw(ctx, c)
		this.leftLeg.draw(ctx, c)
		this.rightLeg.draw(ctx, c)
		this.leftArm.draw(ctx, c)
		this.rightArm.draw(ctx, c)

		ctx.restore()
	}
})
