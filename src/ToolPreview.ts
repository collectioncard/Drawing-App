export class ToolPreview {
    mouseX: number;
    mouseY: number;
    private toolRadius: number;

    constructor(mouseX: number, mouseY: number, toolSize: number) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.toolRadius = toolSize / 2;
    }

    setToolSize(toolSize: number) {
        this.toolRadius = toolSize / 2;
    }

    movePreview(mouseX: number, mouseY: number) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }

    display(ctx: CanvasRenderingContext2D) {
        //The previous draw action might have changed the width of the line, so reset it
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, this.toolRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}