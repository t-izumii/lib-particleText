import * as PIXI from "pixi.js";
import { getResponsiveOptions, type ResponsiveOptions } from "../particle-system/utils";

export interface MetaballFilterOptions extends ResponsiveOptions {
  blur?: number;
  threshold?: number;
  breakpoints?: {
    [width: number]: Partial<MetaballFilterOptions>;
  };
}

export class MetaballFilter {
  private blurFilter!: PIXI.BlurFilter;
  private thresholdFilter!: PIXI.Filter;
  private baseOptions: MetaballFilterOptions;
  private currentOptions: MetaballFilterOptions;
  private pixiApp: PIXI.Application;

  constructor(pixiApp: PIXI.Application, options: MetaballFilterOptions = {}) {
    this.pixiApp = pixiApp;

    // デフォルト設定とユーザー設定をマージ
    this.baseOptions = {
      blur: 2,
      threshold: 0.5,
      ...options,
    };

    // 現在の画面幅に応じた設定を適用
    this.currentOptions = getResponsiveOptions(this.baseOptions);

    // 初期フィルター適用
    this.applyFilters();

    // リサイズイベントリスナーを設定
    this.setEventListener();
  }

  /**
   * フィルターを適用
   */
  private applyFilters(): void {
    if (!this.pixiApp) return;

    this.pixiApp.stage.filters = this.getMetaballFilter();
    this.pixiApp.stage.filterArea = this.pixiApp.renderer.screen;
  }

  private createBlurFilter(number: number) {
    // ブラーフィルターの設定
    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blur = number;
    this.blurFilter.autoFit = true;

    return this.blurFilter;
  }

  private createThresholdFilter(number: number) {
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
   * リサイズイベントリスナーを設定
   */
  private setEventListener(): void {
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  /**
   * リサイズハンドラー
   */
  private handleResize(): void {
    const newOptions = getResponsiveOptions(this.baseOptions);

    // オプションが変更された場合のみフィルターを再適用
    if (JSON.stringify(newOptions) !== JSON.stringify(this.currentOptions)) {
      this.currentOptions = newOptions;

      // フィルターを再適用
      this.applyFilters();
    }
  }

  /**
   * メタボールフィルター
   */
  getMetaballFilter(options?: {
    blur?: number;
    threshold?: number;
  }): PIXI.Filter[] {
    const blur =
      options?.blur !== undefined ? options.blur : this.currentOptions.blur!;
    const threshold =
      options?.threshold !== undefined
        ? options.threshold
        : this.currentOptions.threshold!;

    const blurFilter = this.createBlurFilter(blur);
    const thresholdFilter = this.createThresholdFilter(threshold);

    return [blurFilter, thresholdFilter];
  }
}
