import { Object3D } from './Object3D.js';
import { BufferGeometry } from '../geometry/BufferGeometry.js';
import { BasicMaterial } from '../materials/BasicMaterial.js';

/** A geometry drawn with a material. Geometries and materials can be shared between meshes. */
export class Mesh extends Object3D {
	constructor(geometry = new BufferGeometry(), material = new BasicMaterial()) {
		super();
		this.geometry = geometry;
		this.material = material;
	}
}
Mesh.prototype.isMesh = true;
