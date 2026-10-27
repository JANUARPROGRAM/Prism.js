import { Texture } from '../textures/Texture.js';

/** Loads PNG / JPEG / WebP (whatever the browser can decode) into a Texture. Browser only. */
export class TextureLoader {
	constructor() {
		/** Needed for images from another origin (CDNs such as jsDelivr send the CORS headers). */
		this.crossOrigin = 'anonymous';
		this._urlModifier = null;
		this._createImage = () => {
			if (typeof Image === 'undefined') {
				throw new Error('Vertex: TextureLoader needs a browser environment (the Image class is not available).');
			}
			return new Image();
		};
	}

	/** `fn(url) => url` is applied to every URL before loading (e.g. to map names to data: URLs). */
	setURLModifier(fn) {
		this._urlModifier = fn;
		return this;
	}

	/**
	 * Returns the Texture immediately; its `image` is filled in when loading finishes
	 * (until then it renders as white). Errors go to `onError`, or console.error if omitted.
	 */
	load(url, onLoad, onError) {
		const texture = new Texture();
		texture.name = url;
		const image = this._createImage();
		image.crossOrigin = this.crossOrigin;
		image.onload = () => {
			texture.image = image;
			texture.needsUpdate = true;
			if (onLoad) onLoad(texture);
		};
		image.onerror = () => {
			const error = new Error(`Vertex: Failed to load texture "${url}".`);
			if (onError) onError(error);
			else console.error(error);
		};
		image.src = this._urlModifier ? this._urlModifier(url) : url;
		return texture;
	}

	/** Promise version: resolves with the Texture once the image has loaded. */
	loadAsync(url) {
		return new Promise((resolve, reject) => { this.load(url, resolve, reject); });
	}
}
