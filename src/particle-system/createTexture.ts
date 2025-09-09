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

  setTextWithFont(
    str: string,
    fontString: string,
    density: number,
    stageWidth: number,
    stageHeight: number
  ) {
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

    //　debug
    this.canvas.title = `テキスト描画デバッグ: "${this.str}" (density: ${this.density})`;
    document.body.appendChild(this.canvas);

    return this.dotPos(this.density, this.stageWidth, this.stageHeight);
  }

  private dotPos(density: number, stageWidth: number, stageHeight: number) {
    // キャンバス全体のピクセルデータを取得
    const imageData = this.ctx.getImageData(0, 0, stageWidth, stageHeight).data;

    const particles = [];
    let i = 0; // 行カウンター
    let width = 0; // 現在のX座標
    let pixel: number; // 現在のピクセルのアルファ値

    // Y軸方向にdensity間隔でスキャン
    for (let height = 0; height < stageHeight; height += density) {
      ++i;

      // 六角格子パターン：偶数行をオフセットして配置
      const slide = i % 2 === 0;
      width = 0;

      if (slide) {
        width += 0; // 偶数行は6ピクセル右にずらす
      }

      // X軸方向にdensity間隔でスキャン
      for (width; width < stageWidth; width += density) {
        // ピクセルのアルファ値を取得（RGBA形式の4番目の要素）
        pixel = imageData[(width + height * stageWidth) * 4 - 1];

        // アルファ値が0でない（透明でない）かつ画面内の場合、座標を追加
        if (
          pixel !== 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight
        ) {
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    return particles;
  }

  resize(newWidth: number, newHeight: number) {
    this.stageWidth = newWidth;
    this.stageHeight = newHeight;

    return this.setTextWithFont(
      this.str,
      this.fontString,
      this.density,
      this.stageWidth,
      this.stageHeight
    );
  }
}
