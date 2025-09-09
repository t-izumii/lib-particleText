import { ParticlePositionExtractor } from "./ParticlePositionExtractor";

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private str!: string;
  private fontString!: string;
  private imageSrc!: string;
  private imgWidth!: number;
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

  generateFromText(
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

    // ParticlePositionExtractorインスタンスを作成してpositionsを取得
    const extractor = new ParticlePositionExtractor(
      this.ctx,
      this.density,
      this.stageWidth,
      this.stageHeight
    );
    
    return extractor.getPositions();
  }

  generateFromImage(
    imageSrc: string,
    density: number,
    stageWidth: number,
    stageHeight: number,
    imgWidth?: number
  ): Promise<{ x: number; y: number }[]> {
    this.imageSrc = imageSrc;
    this.imgWidth = imgWidth || 0;
    this.density = density;
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    return new Promise((resolve, reject) => {
      this.clearCanvas(this.stageWidth, this.stageHeight);

      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        // 再度キャンバスをクリア（画像読み込み完了後）
        this.clearCanvas(this.stageWidth, this.stageHeight);

        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (imgWidth) {
          // imgWidthが指定されている場合、アスペクト比を保って高さを計算
          drawWidth = imgWidth;
          drawHeight = (imgWidth / image.width) * image.height;
          offsetX = (this.stageWidth - drawWidth) / 2;
          offsetY = (this.stageHeight - drawHeight) / 2;
        } else {
          // アスペクト比を保ちながらキャンバスに収まるサイズを計算（contain方式）
          const imageAspect = image.width / image.height;
          const canvasAspect = this.stageWidth / this.stageHeight;

          if (imageAspect > canvasAspect) {
            // 画像が横長の場合、幅に合わせる
            drawWidth = this.stageWidth;
            drawHeight = this.stageWidth / imageAspect;
            offsetX = 0;
            offsetY = (this.stageHeight - drawHeight) / 2;
          } else {
            // 画像が縦長の場合、高さに合わせる
            drawHeight = this.stageHeight;
            drawWidth = this.stageHeight * imageAspect;
            offsetX = (this.stageWidth - drawWidth) / 2;
            offsetY = 0;
          }
        }

        // アスペクト比を保ちながら中央に配置して描画
        this.ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        // ParticlePositionExtractorインスタンスを作成してpositionsを取得
        const extractor = new ParticlePositionExtractor(
          this.ctx,
          this.density,
          this.stageWidth,
          this.stageHeight
        );
        
        resolve(extractor.getPositions());
      };

      // エラーハンドリングも追加
      image.onerror = () => {
        console.error(`Failed to load image: ${imageSrc}`);
        reject(new Error(`Failed to load image: ${imageSrc}`));
      };
    });
  }

  resize(newWidth: number, newHeight: number) {
    this.stageWidth = newWidth;
    this.stageHeight = newHeight;

    // テキストの場合
    if (this.str && this.fontString) {
      return this.generateFromText(
        this.str,
        this.fontString,
        this.density,
        this.stageWidth,
        this.stageHeight
      );
    }

    // 画像の場合（imageSrcが保存されている場合）
    if (this.imageSrc) {
      return this.generateFromImage(
        this.imageSrc,
        this.density,
        this.stageWidth,
        this.stageHeight,
        this.imgWidth || undefined
      );
    }

    return [];
  }
}
