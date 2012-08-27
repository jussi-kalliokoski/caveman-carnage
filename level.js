function GameLevel (options) {
	extend(this, options)
}

GameLevel.prototype = {
	paths: null,
	cachedMap: null,
	collisionMap: null,

	level: 0,

	minCaves: 5,
	maxCaves: 15,
	minCaveLength: 30,
	maxCaveLength: 50,
	caveWidth: 80,
	nodeDistance: 30,
	accuracyScale: 1 / 12,

	mapWidth: 800,
	mapHeight: 600,

	generatePaths: function (callback) {
		var paths = []

		var pathCount = ~~(Math.random() *
			(this.maxCaves - this.minCaves)) + this.minCaves

		for (var i=0; i<pathCount; i++) {
			var l = ~~(Math.random() * (this.maxCaveLength -
				this.minCaveLength)) + this.minCaveLength

			var x = ~~(Math.random() * this.mapWidth)
			var y = 0 // ~~(Math.random() * this.mapHeight)
			var angle = Math.random() * Math.PI * 2

			var path = [[x, y]]

			for (var n=1; n<l; n++) {
				x += Math.cos(angle) * this.nodeDistance
				y += Math.sin(angle) * this.nodeDistance

				if (
					x < 0 ||
					y < 0 ||
					x >= this.mapWidth ||
					y >= this.mapHeight
				) break

				path.push([x, y])

				angle += Math.sin(Math.random() * Math.PI * 2)
			}

			if (path.length === 1) {
				i -= 1

				continue
			}

			paths.push(path)
		}

		this.drawPaths(paths, callback)
	},

	drawPaths: function (paths, callback) {
		var c = document.createElement('canvas')

		c.width = ~~(this.mapWidth * this.accuracyScale)
		c.height = ~~(this.mapHeight * this.accuracyScale)

		var ctx = c.getContext('2d')

		ctx.fillStyle = 'white'
		ctx.lineWidth = 80

		ctx.fillRect(0, 0, c.width, c.height)

		ctx.scale(this.accuracyScale, this.accuracyScale)

		paths.forEach(function (path) {
			ctx.beginPath()

			ctx.moveTo(path[0][0], path[0][1])

			for (var i=1; i<path.length; i++) {
				ctx.lineTo(path[i][0], path[i][1])
			}

			ctx.stroke()
		})

		var self = this

		vectorizer.create(ctx.getImageData(
			0, 0, c.width, c.height
		), function (polygons) {
			self.paths = polygons.map(function (polygon) {
				return polygon.map(function (p) {
					return [
						p[0] / self.accuracyScale,
						p[1] / self.accuracyScale
					]
				})
			})

			self.cacheMap()

			callback()
		})
	},

	cacheMap: function () {
		var c = document.createElement('canvas')

		c.width = this.mapWidth
		c.height = this.mapHeight

		var ctx = c.getContext('2d')

		this.drawMap(ctx, c)

		this.cachedMap = c

		c = document.createElement('canvas')

		c.width = this.mapWidth
		c.height = this.mapHeight

		ctx = c.getContext('2d')

		ctx.drawImage(this.cachedMap, 0, 0)

		this.collisionMap = c
	},

	create: function (world, bodyDef, fixDef) {
		this.bodies = []
		this.fixtures = []

		for (var i=0; i<this.paths.length; i++) {
			var polygon = this.paths[i]

			for (var n=0; n<polygon.length; n++) {
				var prev = n ? polygon[n] :
					polygon[polygon.length - 1]
				var next = n === polygon.length - 1 ?
					polygon[0] : polygon[n + 1]

				var minx = Math.min(prev[0], next[0])
				var miny = Math.min(prev[1], next[1])
				var maxx = Math.max(prev[0], next[0])
				var maxy = Math.max(prev[1], next[1])

				var w = maxx - minx
				var h = maxy - miny

				var cx = minx + w / 2
				var cy = miny + h / 2

				bodyDef.position.x = cx
				bodyDef.position.y = cy
				bodyDef.angle = 0

				fixDef.shape = new b2PolygonShape()
				fixDef.shape.SetAsBox(w / 2, h / 2)

				bodyDef.userData = this

				var body = world.CreateBody(bodyDef)
				var fixture = body.CreateFixture(fixDef)

				this.bodies.push(body)
				this.fixtures.push(fixture)
			}
		}

		return this
	},

	drawMap: function (ctx, c) {
		this.paths.forEach(function (path) {
			ctx.beginPath()

			ctx.moveTo(path[0][0], path[0][1])

			for (var i=1; i<path.length; i++) {
				ctx.lineTo(path[i][0], path[i][1])
			}

			ctx.closePath()
			ctx.fill()
		})
	},

	addCollisionArea: function (x, y, width, height) {
		this.collisionMap.getContext('2d')
			.fillRect(x, y, width, height)
	},

/* TODO: There's gotta be a better way to do this... */
	collides: function (x, y, width, height) {
		width = ~~width
		height = ~~height

		var c = this.collider

		if (
			!c ||
			c.width !== width ||
			c.height !== height
		) {
			this.collider = c = document.createElement('canvas')

			c.width = width
			c.height = height
		}

		var ctx = c.getContext('2d')

		if (
			x < 0 ||
			y < 0 ||
			x + width >= this.mapWidth ||
			y + height >= this.mapHeight
		) return true

		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, width, height)

		ctx.drawImage(this.collisionMap, -x, -y)

		var imgdata = ctx.getImageData(0, 0, width, height)
		var data = imgdata.data

		for (var i=0; i<data.length; i+=4) {
			if (!data[i]) return true
		}

		return false
	},

	draw: function (ctx, c) {
		ctx.drawImage(this.cachedMap, 0, 0)
	}
}
