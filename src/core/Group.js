import { Object3D } from './Object3D.js';

/** An Object3D that only groups children (for example the parts of a loaded model). */
export class Group extends Object3D {}
Group.prototype.isGroup = true;
