import { Matrix4 } from '../math/Matrix4.js';

class RenderItem {
	constructor() {
		this.mesh = null;
		this.geometry = null;
		this.material = null;
		this.modelView = new Matrix4();
		/** Distance in front of the camera (larger = farther). */
		this.depth = 0;
	}
}

// Opaque: group by program/material to minimise state changes, then near to far.
function sortOpaque(a, b) {
	if (a.material.type !== b.material.type) return a.material.type < b.material.type ? -1 : 1;
	if (a.material.id !== b.material.id) return a.material.id - b.material.id;
	return a.depth - b.depth;
}

// Transparent: far to near so blending composites correctly.
function sortTransparent(a, b) {
	return b.depth - a.depth;
}

/** Per-frame list of things to draw. Items are pooled, so steady-state frames allocate nothing. */
export class RenderList {
	constructor() {
		this.opaque = [];
		this.transparent = [];
		this._pool = [];
		this._used = 0;
	}

	reset() {
		this._used = 0;
		this.opaque.length = 0;
		this.transparent.length = 0;
	}

	push(mesh, geometry, material) {
		let item = this._pool[this._used];
		if (item === undefined) item = this._pool[this._used] = new RenderItem();
		this._used++;
		item.mesh = mesh;
		item.geometry = geometry;
		item.material = material;
		(material.transparent || material.opacity < 1 ? this.transparent : this.opaque).push(item);
		return item;
	}

	sort() {
		this.opaque.sort(sortOpaque);
		this.transparent.sort(sortTransparent);
	}
}
