/*
 * This Map connects the objects type value with their
 * class implementation. It used from any object to understand which are
 * the classes to enlive when requesting a object.type = 'path' for example.
 * Objects uses it for clipPath, Canvas uses it for everything.
 * This is necessary for generic code to run and enlive instances from serialized representation.
 * You can customize which classes get enlived from SVG parsing using this classRegistry.
 * The Registry start empty and gets filled in depending which files you import.
 * If you want to be able to parse arbitrary SVGs or JSON representation of canvases, coming from
 * differnet sources you will need to import all fabric because you may need all classes.
 */

import { Constructor } from '../typedefs';

export const JSON = 'json';
export const SVG = 'svg';

export type TJSONResolver<T extends Constructor> = {
  fromObject(
    data: unknown,
    options?: unknown
  ): InstanceType<T> | Promise<InstanceType<T>>;
};

export type TSVGResolver<T extends Constructor> = {
  fromElement(
    svgEl: SVGElement,
    instance: InstanceType<T>,
    options: unknown
  ): InstanceType<T> | Promise<InstanceType<T>>;
};

export class ClassRegistry {
  [JSON]: Map<string, any>;
  [SVG]: Map<string, any>;

  constructor() {
    this[JSON] = new Map();
    this[SVG] = new Map();
  }

  getClass<T extends Constructor = any>(classType: string): TJSONResolver<T>;
  getClass<T extends Constructor = any>(
    data: Record<string, any>
  ): TJSONResolver<T>;
  getClass<T extends Constructor = any>(
    arg0: string | Record<string, any>
  ): TJSONResolver<T> {
    if (typeof arg0 === 'object' && arg0.colorStops) {
      arg0 = 'gradient';
    }
    const constructor = this[JSON].get(
      typeof arg0 === 'string' ? arg0 : arg0.type
    );
    if (!constructor) {
      throw new Error(`No class registered for ${arg0}`);
    }
    return constructor;
  }

  setClass(classConstructor: any, classType?: string) {
    this[JSON].set(
      classType ?? classConstructor.prototype.type,
      classConstructor
    );
  }

  getSVGClass<T extends Constructor = any>(
    SVGTagName: string
  ): TSVGResolver<T> {
    const classConstructor = this[SVG].get(SVGTagName);
    if (classConstructor) {
      return classConstructor;
    } else {
      throw new Error(`No class registered for SVG tag ${SVGTagName}`);
    }
  }

  setSVGClass(classConstructor: any, SVGTagName?: string) {
    this[SVG].set(
      SVGTagName ?? classConstructor.prototype.type,
      classConstructor
    );
  }
}

const classRegistry = new ClassRegistry();

export { classRegistry };