export class generateParticlePositions {
  private ctx: CanvasRenderingContext2D;
  private density!: number;
  private stageWidth!: number;
  private stageHeight!: number;
  private particles: { x: number; y: number }[] = [];

  constructor(
    ctx: CanvasRenderingContext2D,
    density: number,
    stageWidth: number,
    stageHeight: number
  ) {
    this.ctx = ctx;
    this.density = density;
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    this.particles = this.extractPositions();
  }

  /**
   * パーティクル座標を抽出
   */
  private extractPositions(): { x: number; y: number }[] {
    // キャンバス全体のピクセルデータを取得
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.stageWidth,
      this.stageHeight
    ).data;

    const particles = [];
    let i = 0; // 行カウンター
    let width = 0; // 現在のX座標
    let pixel: number; // 現在のピクセルのアルファ値

    // Y軸方向にdensity間隔でスキャン
    for (let height = 0; height < this.stageHeight; height += this.density) {
      ++i;

      // 六角格子パターン：偶数行をオフセットして配置
      const slide = i % 2 === 0;
      width = 0;

      if (slide) {
        width += 6; // 偶数行は6ピクセル右にずらす
      }

      // X軸方向にdensity間隔でスキャン
      for (width; width < this.stageWidth; width += this.density) {
        // ピクセルのアルファ値を取得（RGBA形式の4番目の要素）
        pixel = imageData[(width + height * this.stageWidth) * 4 + 3];

        // アルファ値が0でない（透明でない）かつ画面内の場合、座標を追加
        if (
          pixel !== 0 &&
          width >= 0 &&
          width < this.stageWidth &&
          height >= 0 &&
          height < this.stageHeight
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

  /**
   * 生成されたパーティクル座標を取得
   */
  getPositions(): { x: number; y: number }[] {
    return this.particles;
  }
}
