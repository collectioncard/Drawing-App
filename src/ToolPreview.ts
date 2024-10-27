export class ToolPreview {
    mouseX: number;
    mouseY: number;
    private toolRadius: number | null = 1;
    private sticker : string | null = null;

    setToolSize(toolSize: number) {
        this.toolRadius = toolSize / 2;
        this.sticker = null;
    }

    movePreview(mouseX: number, mouseY: number) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }

    setSticker(sticker: string) {
        this.sticker = sticker;
        this.toolRadius = null;
    }

    display(ctx: CanvasRenderingContext2D) {

        if (this.toolRadius === null && this.sticker) {
            ctx.font = "24px serif";
            ctx.fillText(this.sticker, this.mouseX - 15, this.mouseY);
            return;
        }else if (this.toolRadius !== null) {
            //The previous draw action might have changed the width of the line, so reset it
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(this.mouseX, this.mouseY, this.toolRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}