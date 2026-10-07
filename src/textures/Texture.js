import { ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter } from '../constants.js';

let _nextId = 1;

/**
 * A 2D image used by a material (`material.map`). `image` can be an
 * HTMLImageElement, ImageBitmap, canvas, or raw RGBA bytes: `{ data: Uint8Array, width, height }`.
 *
 * Until the image is ready (still loading, or null) the renderer samples a 1x1 white pixel,
 * so the material color shows. After changing `image` or its pixels, set `needsUpdate = true`.
 * UV origin is bottom-left (`flipY = true` matches that for normal image files).
 */
export class Texture {
	constructor(image = null) {
		this.id = _nextId++;
		this.name = '';
		this.image = image;
		this.wrapS = ClampToEdgeWrapping;
		this.wrapT = ClampToEdgeWrapping;
		this.magFilter = LinearFilter;
		this.minFilter = LinearMipmapLinearFilter;
		/** Build mipmaps on upload (any size works in WebGL2). */
		this.generateMipmaps = true;
		this.flipY = true;
		this.version = 0;
		this._disposeListeners = new Set();
	}

	set needsUpdate(value) { if (value) this.version++; }

	addDisposeListener(listener) { this._disposeListeners.add(listener); }
	removeDisposeListener(listener) { this._disposeListeners.delete(listener); }

	/** Frees the GPU copy (it is re-uploaded if the texture is used again). */
	dispose() {
		for (const listener of [...this._disposeListeners]) listener(this);
	}
}
Texture.prototype.isTexture = true;
