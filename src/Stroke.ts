interface Point { x: number, y: number }

export class Stroke {
    points: Point[];

    constructor(x: number, y: number) {
        this.points = [{ x, y }];
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        this.points.forEach(({ x, y }, i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
        ctx.stroke();
    }
}