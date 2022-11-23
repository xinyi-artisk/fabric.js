import { fabric } from '../../HEADER';
import { Point } from '../point.class';
import { FabricObject } from '../shapes/fabricObject.class';
import { BaseBrush } from './base_brush.class';

// TODO: remove transient
const { Shadow } = fabric;

/**
 * Declarative shape drawing using pointer events
 */
export abstract class DrawShapeBase<T extends FabricObject> extends BaseBrush {
  shape: T | undefined;
  stroke = '';
  fill = '';

  abstract create(): T;

  protected build() {
    this.shape = this.create();
    this.shape.set('canvas', this.canvas);
    this.setStyles();
  }

  setStyles() {
    this.shape?.set({
      stroke: this.stroke || this.color,
      fill: this.fill || this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeMiterLimit: this.strokeMiterLimit,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
      shadow: this.shadow ? new Shadow(this.shadow) : undefined,
    });
  }

  protected finalize() {
    const shape = this.shape;
    if (!shape) return;
    shape.setCoords();
    this.canvas.fire('before:path:created', { path: this.shape });
    this.canvas.add(this.shape);
    this.canvas.fire('path:created', { path: this.shape });
    this.canvas.clearContext(this.canvas.contextTop);
    this.shape = undefined;
  }

  _setBrushStyles() {
    this.setStyles();
  }

  transform(ctx: CanvasRenderingContext2D) {
    const t = this.canvas.viewportTransform;
    const offset = new Point().transform(t);
    ctx.transform(t[0], t[1], t[2], t[3], -offset.x, -offset.y);
  }

  _render(ctx: CanvasRenderingContext2D = this.canvas.contextTop) {
    this.canvas.clearContext(ctx);
    ctx.save();
    this.transform(ctx);
    this.shape!.transform(ctx);
    this.shape!._render(ctx);
    ctx.restore();
  }
}