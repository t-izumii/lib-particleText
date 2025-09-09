import { generateParticlePositions } from "./generateParticlePositions";

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private str!: string;
  private fontString!: string;
  private density!: number;
  private stageWidth!: number;
  private stageHeight!: number;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
    this.str;
    this.fontString;
    this.density;
    this.stageWidth;
    this.stageHeight;
  }

  private clearCanvas(width: number, height: number): void {
    // キャンバスサイズをリセットすることで完全にクリア
    this.canvas.width = width;
    this.canvas.height = height;

    // 念のためにclearRectも実行
    this.ctx.clearRect(0, 0, width, height);

    // コンテキストの状態をリセット
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;
  }

  generateTextCtx(
    str: string,
    fontString: string,
    density: number,
    stageWidth: number,
    stageHeight: number
  ): { x: number; y: number }[] {
    this.str = str;
    this.fontString = fontString;
    this.density = density;
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    this.clearCanvas(this.stageWidth, this.stageHeight);

    this.ctx.font = this.fontString;
    this.ctx.fillStyle = `rgba(0,0,0,1.0)`;
    this.ctx.textBaseline = "middle";

    // テキストの描画位置を計算（画面中央に配置）
    const fontPos = this.ctx.measureText(this.str);

    // テキストを描画
    this.ctx.fillText(
      this.str,
      (this.stageWidth - fontPos.width) / 2, // 水平中央
      this.stageHeight / 2 // 垂直中央（シンプル）
    );

    // generateParticlePositionsインスタンスを作成してpositionsを取得
    const generator = new generateParticlePositions(
      this.ctx,
      this.density,
      this.stageWidth,
      this.stageHeight
    );
    
    return generator.getPositions();
  }

  resize(newWidth: number, newHeight: number) {
    this.stageWidth = newWidth;
    this.stageHeight = newHeight;

    return this.generateTextCtx(
      this.str,
      this.fontString,
      this.density,
      this.stageWidth,
      this.stageHeight
    );
  }
}
