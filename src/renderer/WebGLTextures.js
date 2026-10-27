const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);

function isMipmapFilter(filter) {
	return filter >= 9984 && filter <= 9987; // NEAREST/LINEAR_MIPMAP_NEAREST/LINEAR
}

/** True once the image has pixels the GPU can read. */
function isImageReady(image) {
	if (!image) return false;
	if (image.data) return image.width > 0 && image.height > 0;
	if (image.complete === false) return false; // HTMLImageElement still loading
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	return width > 0;
}

/**
 * GPU copies of Texture objects. Only texture unit 0 is used (one map per material).
 * Uploaded when first used and again whenever `texture.version` changes.
 */
export class WebGLTextures {
	constructor(gl, info) {
		this.gl = gl;
		this.info = info;
		this._records = new Map();
		this._bound = null;
		this._maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this._onTextureDispose = (texture) => this.release(texture);
	}

	/** Forget what is bound (other code may have changed it) and select unit 0. */
	resetBindings() {
		this._bound = null;
		this.gl.activeTexture(this.gl.TEXTURE0);
	}

	/** Binds `texture` to unit 0, uploading or refreshing it first if needed. */
	bind(texture) {
		const gl = this.gl;
		const record = this._get(texture);
		if (this._bound !== record.glTexture) {
			gl.bindTexture(gl.TEXTURE_2D, record.glTexture);
			this._bound = record.glTexture;
		}
	}

	_get(texture) {
		let record = this._records.get(texture);
		if (record === undefined) {
			record = { glTexture: this.gl.createTexture(), version: -1, ready: false };
			this._records.set(texture, record);
			texture.addDisposeListener(this._onTextureDispose);
			this.info.memory.textures = this._records.size;
		}
		if (isImageReady(texture.image)) {
			if (!record.ready || record.version !== texture.version) this._upload(record, texture);
		} else if (record.version === -1) {
			this._uploadPlaceholder(record);
		}
		return record;
	}

	_bindForUpload(record) {
		this.gl.bindTexture(this.gl.TEXTURE_2D, record.glTexture);
		this._bound = record.glTexture;
	}

	_uploadPlaceholder(record) {
		const gl = this.gl;
		this._bindForUpload(record);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, WHITE_PIXEL);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		record.version = 0;
		record.ready = false;
	}

	_upload(record, texture) {
		const gl = this.gl, image = texture.image;
		const width = image.data ? image.width : (image.naturalWidth ?? image.videoWidth ?? image.width);
		const height = image.data ? image.height : (image.naturalHeight ?? image.videoHeight ?? image.height);
		if (width > this._maxSize || height > this._maxSize) {
			throw new Error(
				`Vertex: Texture "${texture.name || texture.id}" is ${width}x${height}, larger than this device's ` +
					`maximum texture size (${this._maxSize}). Resize the image.`
			);
		}

		this._bindForUpload(record);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
		if (image.data) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texture.wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texture.wrapT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.magFilter);
		// A mipmap min filter without mipmaps would make the texture incomplete (renders black).
		const minFilter = !texture.generateMipmaps && isMipmapFilter(texture.minFilter) ? gl.LINEAR : texture.minFilter;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
		if (texture.generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);

		record.version = texture.version;
		record.ready = true;
	}

	/** Frees the GPU copy of one texture. */
	release(texture) {
		const record = this._records.get(texture);
		if (record === undefined) return;
		if (this._bound === record.glTexture) this._bound = null;
		this.gl.deleteTexture(record.glTexture);
		texture.removeDisposeListener(this._onTextureDispose);
		this._records.delete(texture);
		this.info.memory.textures = this._records.size;
	}

	/** Forgets all records without deleting GL objects (they died with a lost context). */
	clear() {
		this._records.clear();
		this._bound = null;
		this.info.memory.textures = 0;
	}

	dispose() {
		for (const texture of [...this._records.keys()]) this.release(texture);
	}
}
