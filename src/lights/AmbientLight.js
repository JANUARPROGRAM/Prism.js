import { Light } from './Light.js';

/** Light that reaches every surface equally from every direction. Position is irrelevant. */
export class AmbientLight extends Light {}
AmbientLight.prototype.isAmbientLight = true;
