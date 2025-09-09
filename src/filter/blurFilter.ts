import * as PIXI from "pixi.js";

export interface MetaballFilterOptions {
  blur?: number;
  threshold?: number;
  breakpoints?: {
    [width: number]: Partial<MetaballFilterOptions>;
  };
}

export class FilterManager {
  private blurFilter!: PIXI.BlurFilter;
  private thresholdFilter!: PIXI.Filter;
  private baseOptions: MetaballFilterOptions;
  private currentOptions: MetaballFilterOptions;
  private pixiApp?: PIXI.Application;

  constructor(options: MetaballFilterOptions = {}) {
    // デフォルト設定とユーザー設定をマージ
    this.baseOptions = {
      blur: 2,
      threshold: 0.5,
      ...options,
    };

    // 現在の画面幅に応じた設定を適用
    this.currentOptions = this.getResponsiveOptions();

    // リサイズイベントリスナーを設定
    this.setEventListener();
  }

  /**
   * PIXIアプリケーションを初期化してフィルターを適用
   */
  init(pixiApp: PIXI.Application): void {
    this.pixiApp = pixiApp;
    this.applyFilters();
  }

  /**
   * フィルターを適用
   */
  private applyFilters(): void {
    if (!this.pixiApp) return;

    this.pixiApp.stage.filters = this.getMetaballFilter();
    this.pixiApp.stage.filterArea = this.pixiApp.renderer.screen;
  }

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
   * 現在の画面幅に応じた設定を取得
   */
  private getResponsiveOptions(): MetaballFilterOptions {
    const currentWidth = window.innerWidth;
    let responsiveOptions = { ...this.baseOptions };

    if (this.baseOptions.breakpoints) {
      // breakpointsを幅の昇順でソート
      const sortedBreakpoints = Object.keys(this.baseOptions.breakpoints)
        .map(Number)
        .sort((a, b) => a - b);

      // 現在の幅以下の最大のbreakpointを見つける
      for (const breakpoint of sortedBreakpoints) {
        if (currentWidth <= breakpoint) {
          responsiveOptions = {
            ...responsiveOptions,
            ...this.baseOptions.breakpoints[breakpoint],
          };
          break; // 最初に条件に合うbreakpointを適用して終了
        }
      }
    }
    return responsiveOptions;
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
    const newOptions = this.getResponsiveOptions();

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

    const blurFilter = this.setBlurFilter(blur);
    const thresholdFilter = this.setThresholdFilter(threshold);

    return [blurFilter, thresholdFilter];
  }

  /**
   * 現在のオプションを取得
   */
  getCurrentOptions(): MetaballFilterOptions {
    return this.currentOptions;
  }
}
