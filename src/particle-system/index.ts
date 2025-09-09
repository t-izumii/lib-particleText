import * as PIXI from "pixi.js";
// import { ParticlePositionsGenerator } from "./ParticlePositionsGenerator";
import { TextureGenerator } from "./TextureGenerator";
import { ParticleManager } from "./ParticleManager";
import { MouseInteraction } from "./MouseInteraction";
import { mouseState } from "../lib/MouseState";

export interface FontOptions {
  size?: string;
  family?: string;
  weight?: string | number;
}

export interface ParticleSystemOptions {
  text?: string;
  font?: FontOptions;
  density?: number;
  enableFilter?: boolean;
  anchor?: number;
  scale?: number;
  tint?: number;
  mouseRadius?: number;
  mouseForce?: number;
  returnForce?: number;
  friction?: number;
  breakpoints?: {
    [width: number]: Partial<ParticleSystemOptions>;
  };
}

export class ParticleSystem {
  private textureGenerator: TextureGenerator;
  private particleManager!: ParticleManager;
  private particleTexture?: PIXI.Texture;
  private pixiApp: PIXI.Application;
  private mouseInteraction: MouseInteraction;
  private options: ParticleSystemOptions;
  private baseOptions: ParticleSystemOptions;

  constructor(pixiApp: PIXI.Application, options: ParticleSystemOptions = {}) {
    this.textureGenerator = new TextureGenerator();
    this.pixiApp = pixiApp;
    // デフォルト設定とユーザー設定をマージ
    this.baseOptions = {
      text: "HELLO",
      font: {
        size: "100px",
        family: "Arial",
        weight: "normal",
      },
      density: 4,
      enableFilter: false,
      anchor: 0.5,
      scale: 0.1,
      tint: 0x000000,
      mouseRadius: 120,
      mouseForce: 0.8,
      returnForce: 0.03,
      friction: 0.92,
      ...options,
    };

    // 現在の画面幅に応じた設定を適用
    this.options = this.getResponsiveOptions();

    // マウスインタラクションを初期化
    this.mouseInteraction = new MouseInteraction(
      this.options.mouseRadius!, // 反発半径
      this.options.mouseForce!, // 反発力
      this.options.returnForce!, // 復帰力
      this.options.friction! // 摩擦
    );

    this.init();
  }

  /**
   * fontオブジェクトを文字列に変換
   */
  private fontToString(font: FontOptions): string {
    const weight = font.weight || "normal";
    const size = font.size || "100px";
    const family = font.family || "Arial";
    return `${weight} ${size} ${family}`;
  }

  /**
   * パーティクルテキストシステムを初期化
   */
  private async init(): Promise<void> {
    // パーティクル画像を読み込み（固定パス）
    this.particleTexture = await PIXI.Assets.load("./particle.png");

    // テキストからパーティクル座標を生成
    const particles = this.textureGenerator.generateFromText(
      this.options.text!, // テキスト
      this.fontToString(this.options.font!), // フォント
      this.options.density!, // 密度
      this.pixiApp.screen.width, // ステージ幅
      this.pixiApp.screen.height // ステージ高さ
    );

    // ParticleSystemを初期化してパーティクルを描画
    this.particleManager = new ParticleManager(
      this.particleTexture,
      this.options
    );
    this.particleManager.renderParticles(particles, this.pixiApp.stage);

    this.setEventListener();
    this.startAnimation();
  }

  setEventListener() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  /**
   * パーティクルシステムを取得
   */
  getParticleManager(): ParticleManager {
    return this.particleManager;
  }

  /**
   * テクスチャジェネレーターを取得
   */
  getTextureGenerator(): TextureGenerator {
    return this.textureGenerator;
  }

  resize() {
    const newWidth = this.pixiApp.screen.width;
    const newHeight = this.pixiApp.screen.height;

    // breakpoint設定を再適用
    this.options = this.getResponsiveOptions();

    // 新しい設定でテキストからパーティクル座標を再生成
    const particles = this.textureGenerator.generateTextCtx(
      this.options.text!,
      this.fontToString(this.options.font!),
      this.options.density!,
      newWidth,
      newHeight
    );

    // パーティクルを再作成
    this.particleManager.updateOptions(this.options);
    this.particleManager.renderParticles(particles, this.pixiApp.stage);

    // マウスインタラクションの設定も更新
    this.mouseInteraction.updateSettings({
      repelRadius: this.options.mouseRadius!,
      repelForce: this.options.mouseForce!,
      returnForce: this.options.returnForce!,
      friction: this.options.friction!,
    });
  }

  /**
   * 現在の画面幅に応じた設定を取得
   */
  private getResponsiveOptions(): ParticleSystemOptions {
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
   * アニメーションループを開始
   */
  private startAnimation(): void {
    this.pixiApp.ticker.add(() => {
      // グローバルマウス座標を取得してキャンバス相対座標に変換
      const canvas = this.pixiApp.view as HTMLCanvasElement;
      const relativePos = mouseState.getElementRelativePosition(canvas);

      // マウスインタラクションを適用
      this.mouseInteraction.updateMousePosition(relativePos.x, relativePos.y);
      const particleManagerInstance = this.getParticleManager();
      if (particleManagerInstance) {
        this.mouseInteraction.applyMouseInteraction(
          particleManagerInstance.getParticleStates()
        );
        // パーティクル位置を更新
        particleManagerInstance.updateParticlePositions();
      }
    });
  }
}
