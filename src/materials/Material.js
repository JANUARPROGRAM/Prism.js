import { FrontSide } from '../constants.js';

let _nextId = 1;

/**
 * Base class: render state shared by all materials. Subclasses add their own
 * properties, then call `this.setValues(parameters)` at the end of their constructor.
 */
export class Material {
	constructor() {
		this.id = _nextId++;
		/** Selects the shader program; subclasses set this to their class name. */
		this.type = 'Material';
		this.name = '';
		this.visible = true;
		this.opacity = 1;
		/** Blend with what is already drawn. Also implied when opacity < 1. */
		this.transparent = false;
		/** FrontSide, BackSide or DoubleSide. */
		this.side = FrontSide;
		this.depthTest = true;
		this.depthWrite = true;
		this._disposeListeners = new Set();
	}

	/** Assigns constructor options. Unknown keys throw so typos do not fail silently. */
	setValues(values = {}) {
		for (const key of Object.keys(values)) {
			if (!(key in this)) {
				throw new TypeError(`Vertex: "${key}" is not a property of ${this.type}.`);
			}
			this[key] = values[key];
		}
		return this;
	}

	addDisposeListener(listener) { this._disposeListeners.add(listener); }
	removeDisposeListener(listener) { this._disposeListeners.delete(listener); }

	/** Frees GPU resources tied to this material (none yet; programs are shared per material type). */
	dispose() {
		for (const listener of [...this._disposeListeners]) listener(this);
	}
}
Material.prototype.isMaterial = true;
