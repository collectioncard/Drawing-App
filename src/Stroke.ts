interface Point { x: number, y: number }

export class Stroke {
    points: Point[];
    lineThickness: number ;

    constructor(x: number, y: number, lineThickness: number) {
        this.points = [{ x, y }];
        this.lineThickness = lineThickness;
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = this.lineThickness;
        ctx.beginPath();
        this.points.forEach(({ x, y }, i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
        ctx.stroke();
    }
}