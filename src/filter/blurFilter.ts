import * as PIXI from "pixi.js";

export class FilterManager {
  private blurFilter!: PIXI.BlurFilter;
  private thresholdFilter!: PIXI.Filter;

  constructor() {
    this.setupFilters();
  }

  /**
   * ビジュアルエフェクト用のフィルターを設定
   */
  private setupFilters() {
    // ブラーフィルターの設定
    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blur = 5;
    this.blurFilter.autoFit = true;

    const fragSource = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float threshold;
    uniform float mr;
    uniform float mg;
    uniform float mb;
    void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      if (color.a > threshold) {
        gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
      } else {
        gl_FragColor = vec4(vec3(0.0), 0.0);
      }
    }
    `;

    // シェーダーに渡すユニフォーム変数
    const uniformData = {
      threshold: 0.5,
    };

    // カスタムフィルターを作成
    this.thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);

    return this.thresholdFilter;
  }

  /**
   * ブラーフィルターを取得
   */
  getBlurFilter(): PIXI.BlurFilter {
    return this.blurFilter;
  }

  /**
   * シュレッシュホールドフィルターを取得
   */
  getThresholdFilter(): PIXI.Filter {
    return this.thresholdFilter;
  }
}
