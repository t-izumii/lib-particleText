export interface Position {
  x: number;
  y: number;
}

export interface TextGenerationOptions {
  text: string;
  fontString: string;
  density: number;
  stageWidth: number;
  stageHeight: number;
}

export interface ImageGenerationOptions {
  imageSrc: string;
  density: number;
  stageWidth: number;
  stageHeight: number;
}

export class ParticlePositionsGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
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

  /**
   * 既存コードとの互換性を保つためのメソッド
   * @deprecated generateFromTextを使用してください
   */
  generateParticlePositions(
    text: string,
    fontString: string,
    density: number,
    stageWidth: number,
    stageHeight: number
  ): Position[] {
    return this.generateFromText({
      text,
      fontString,
      density,
      stageWidth,
      stageHeight
    });
  }

  /**
   * テキストからパーティクル座標を生成
   */
  generateFromText(options: TextGenerationOptions): Position[] {
    const { text, fontString, density, stageWidth, stageHeight } = options;
    
    this.clearCanvas(stageWidth, stageHeight);

    this.ctx.font = fontString;
    this.ctx.fillStyle = `rgba(0,0,0,1.0)`;
    this.ctx.textBaseline = "middle";

    // テキストの描画位置を計算（画面中央に配置）
    const fontPos = this.ctx.measureText(text);

    // テキストを描画
    this.ctx.fillText(
      text,
      (stageWidth - fontPos.width) / 2, // 水平中央
      stageHeight / 2 // 垂直中央（シンプル）
    );

    return this.extractFromPixels(density, stageWidth, stageHeight);
  }

  /**
   * 画像からパーティクル座標を生成
   */
  generateFromImage(options: ImageGenerationOptions): Promise<Position[]> {
    const { imageSrc, density, stageWidth, stageHeight } = options;
    
    return new Promise((resolve, reject) => {
      this.clearCanvas(stageWidth, stageHeight);

      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        // 再度キャンバスをクリア（画像読み込み完了後）
        this.clearCanvas(stageWidth, stageHeight);

        // 画像のアスペクト比を計算
        const imageAspect = image.width / image.height;
        const canvasAspect = stageWidth / stageHeight;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        // アスペクト比を保ちながらキャンバスに収まるサイズを計算（contain方式）
        if (imageAspect > canvasAspect) {
          // 画像が横長の場合、幅に合わせる
          drawWidth = stageWidth;
          drawHeight = stageWidth / imageAspect;
          offsetX = 0;
          offsetY = (stageHeight - drawHeight) / 2;
        } else {
          // 画像が縦長の場合、高さに合わせる
          drawHeight = stageHeight;
          drawWidth = stageHeight * imageAspect;
          offsetX = (stageWidth - drawWidth) / 2;
          offsetY = 0;
        }

        // アスペクト比を保ちながら中央に配置して描画
        this.ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        // 画像描画後に座標抽出
        const positions = this.extractFromPixels(density, stageWidth, stageHeight);
        resolve(positions);
      };

      // エラーハンドリングも追加
      image.onerror = () => {
        console.error(`Failed to load image: ${imageSrc}`);
        reject(new Error(`Failed to load image: ${imageSrc}`));
      };
    });
  }

  /**
   * ピクセルデータからパーティクル座標を抽出
   */
  private extractFromPixels(
    density: number,
    stageWidth: number,
    stageHeight: number
  ): Position[] {
    // キャンバス全体のピクセルデータを取得
    const imageData = this.ctx.getImageData(0, 0, stageWidth, stageHeight).data;

    const particles: Position[] = [];
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
        width += 6; // 偶数行は6ピクセル右にずらす
      }

      // X軸方向にdensity間隔でスキャン
      for (width; width < stageWidth; width += density) {
        // ピクセルのアルファ値を取得（RGBA形式の4番目の要素）
        pixel = imageData[(width + height * stageWidth) * 4 + 3];

        // アルファ値が0でない（透明でない）かつ画面内の場合、座標を追加
        if (
          pixel !== 0 &&
          width >= 0 &&
          width < stageWidth &&
          height >= 0 &&
          height < stageHeight
        ) {
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    console.log(`${particles.length}個のパーティクル座標を生成しました`);
    return particles;
  }
}
