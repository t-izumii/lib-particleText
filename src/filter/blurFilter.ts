import * as PIXI from "pixi.js";

export class FilterManager {
  private blurFilter!: PIXI.BlurFilter;
  private thresholdFilter!: PIXI.Filter;

  constructor() {}

  private setBlurFilter(number: number) {
    // ブラーフィルターの設定
    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blur = number;
    this.blurFilter.autoFit = true;

    return this.blurFilter;
  }

  private setThresholdFilter(number: number) {
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
      threshold: number,
    };

    // カスタムフィルターを作成
    this.thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);

    return this.thresholdFilter;
  }

  /**
   * ブラーフィルターを取得
   */
  getBlurFilter(number: number = 2): PIXI.BlurFilter {
    return this.setBlurFilter(number);
  }

  /**
   * シュレッシュホールドフィルターを取得
   */
  getThresholdFilter(number: number = 0.5): PIXI.Filter {
    return this.setThresholdFilter(number);
  }
}
