interface Point { x: number, y: number }

export class Stroke {
    points: Point[];
    lineThickness: number;
    sticker: string | null;
    color: string;

    constructor(x: number, y: number, lineThickness: number | null = null, sticker: string | null = null, color: string = "#000000") {
        this.points = [{ x, y }];
        this.lineThickness = lineThickness;
        this.sticker = sticker;
        this.color = color;
    }

    drag(x: number, y: number) {
        if (this.lineThickness !== null) {
            this.points.push({ x, y });
        } else if (this.sticker) {
            this.points[0] = { x, y };
        }
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.sticker) {
            ctx.font = "24px serif";
            ctx.fillText(this.sticker, this.points[0].x - 15, this.points[0].y);
        } else if (this.lineThickness !== null) {
            ctx.lineWidth = this.lineThickness;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            this.points.forEach(({ x, y }, i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
            ctx.stroke();
        }
    }
}