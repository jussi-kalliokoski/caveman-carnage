/*
 * See http://cardhouse.com/computer/vector.htm
*/

this.onmessage = function (e) {
	this.postMessage(Vectorize(e.data))
}

function Vectorize (imagedata) {
	var v = []

	Vectorize.createVectors(v, imagedata)
	Vectorize.simplifyVectors(v)
	Vectorize.lengthenVectors(v)

	return Vectorize.createPolygons(v)
}

Vectorize.createVectors = function (v, imagedata) {
	var w = imagedata.width
	var h = imagedata.height
	var d = imagedata.data

	for (var i=0, n=0; i<d.length; i+=4, n++) {
		if (!d[i]) continue

		Vectorize.addSquareVector(v, n % w, ~~(n / w))
	}
}

Vectorize.addSquareVector = function (vectors, j, k) {
	var n = vectors.length

	var v1 = {
		sx: j,
		sy: k,
		ex: j + 1,
		ey: k,
		status: 0
	}

	var v2 = {
		sx: j + 1,
		sy: k,
		ex: j + 1,
		ey: k + 1,
		status: 0
	}

	var v3 = {
		sx: j + 1,
		sy: k + 1,
		ex: j,
		ey: k + 1,
		status: 0
	}

	var v4 = {
		sx: j,
		sy: k + 1,
		ex: j,
		ey: k,
		status: 0
	}

	v1.prev = v4
	v1.next = v2
	v2.prev = v1
	v2.next = v3
	v3.prev = v2
	v3.next = v4
	v4.prev = v3
	v4.next = v1

	vectors.push(v1, v2, v3, v4)
}

Vectorize.simplifyVectors = function (v) {
	for (var i=1; i<v.length; i++) {
		for (var n=i+1; n<v.length; n++) {
			if (!Vectorize.equalVectors(v, i, n)) continue

			Vectorize.removeVectors(v, i, n)
		}
	}
}

Vectorize.equalVectors = function (v, i, n) {
	var msx, msy, mex, mey, m2sx, m2sy, m2ex, m2ey
	var r = false

	if (v[i].status === -1) return r

	msx = v[i].sx
	msy = v[i].sy
	mex = v[i].ex
	mey = v[i].ey

	m2sx = v[n].sx
	m2sy = v[n].sy
	m2ex = v[n].ex
	m2ey = v[n].ey

	if (
		Vectorize.equalPoints(msx, msy, m2sx, m2sy) &&
		Vectorize.equalPoints(mex, mey, m2ex, m2ey)
	) r = true

	if (
		Vectorize.equalPoints(msx, msy, m2ex, m2ey) &&
		Vectorize.equalPoints(mex, mey, m2sx, m2sy)
	) r = true

	return r
}

Vectorize.equalPoints = function (p1x, p1y, p2x, p2y) {
	return p1x === p2x && p1y === p2y
}

Vectorize.removeVectors = function (v, i, n) {
	Vectorize.removeVector(v, i, n)
	Vectorize.removeVector(v, n, i)

	v[i].status = -1
	v[n].status = -1
}

Vectorize.removeVector = function (v, i, n) {
	var p, m

	p = v[i].prev
	p.next = v[n].next

	m = v[n].next
	m.prev = p
}

Vectorize.lengthenVectors = function (v) {
	for (var i=0; i<v.length; i++) {
		if (!v[i].prev || v[i].status === -1) {
			v.splice(i--, 1)

			continue
		}

		if (
			v[i].prev.sx !== v[i].ex &&
			v[i].prev.sy !== v[i].ey
		) continue

		v[i].prev.ex = v[i].ex
		v[i].prev.ey = v[i].ey
		v[i].prev.next = v[i].next
		v[i].next.prev = v[i].prev

		v[i].status = -1

		v.splice(i--, 1)
	}
}

Vectorize.createPolygons = function (v) {
	var polygons = []

	while (v.length) {
		var vec = v.shift()

		if (vec.status === -1) continue

		var polygon = [[vec.sx, vec.sy]]
		var first = vec

		vec = vec.next

		while (vec && vec !== first) {
			polygon.push([vec.sx, vec.sy])

			vec.status = -1
			vec = vec.next
		}

		if (polygon.length > 1) polygons.push(polygon)
	}

	return polygons
}
