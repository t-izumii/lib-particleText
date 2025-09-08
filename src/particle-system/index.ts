import * as PIXI from "pixi.js";
import { TextureGenerator } from "./createTexture";
import { createParticle } from "./createParticle";
import { MouseInteraction } from "../mouseEvent/MouseInteraction";
import { mouseState } from "../lib/mouseState";

export interface ParticleSystemOptions {
  text?: string;
  font?: string;
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
  private createParticle!: createParticle;
  private particleTexture?: PIXI.Texture;
  private pixiApp: PIXI.Application;
  private mouseInteraction: MouseInteraction;
  private options: ParticleSystemOptions;

  constructor(pixiApp: PIXI.Application, options: ParticleSystemOptions = {}) {
    this.textureGenerator = new TextureGenerator();
    this.pixiApp = pixiApp;
    // デフォルト設定とユーザー設定をマージ
    this.options = {
      text: "HELLO",
      font: "100px Arial",
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
   * パーティクルテキストシステムを初期化
   */
  private async init(): Promise<void> {
    // パーティクル画像を読み込み（固定パス）
    this.particleTexture = await PIXI.Assets.load("./particle.png");

    // テキストからパーティクル座標を生成
    const particles = this.textureGenerator.setTextWithFont(
      this.options.text!, // テキスト
      this.options.font!, // フォント
      this.options.density!, // 密度
      this.pixiApp.screen.width, // ステージ幅
      this.pixiApp.screen.height // ステージ高さ
    );

    // ParticleSystemを初期化してパーティクルを描画
    this.createParticle = new createParticle(
      this.particleTexture,
      this.options
    );
    this.createParticle.createParticles(particles, this.pixiApp.stage);

    this.setEventListener();
    this.startAnimation();
  }

  setEventListener() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  /**
   * パーティクルシステムを取得
   */
  getCreateParticle(): createParticle {
    return this.createParticle;
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

    const particles = this.textureGenerator.resize(newWidth, newHeight);
    this.createParticle.createParticles(particles, this.pixiApp.stage);
  }

  /**
   * アニメーションループを開始
   */
  private startAnimation(): void {
    this.pixiApp.ticker.add(() => {
      // グローバルマウス座標を取得してキャンバス相対座標に変換
      const canvas = this.pixiApp.view as HTMLCanvasElement;
      const relativePos = mouseState.getRelativePosition(canvas);

      // マウスインタラクションを適用
      this.mouseInteraction.updateMousePosition(relativePos.x, relativePos.y);
      const createParticleInstance = this.getCreateParticle();
      if (createParticleInstance) {
        this.mouseInteraction.applyMouseInteraction(
          createParticleInstance.getParticleData()
        );
        // パーティクル位置を更新
        createParticleInstance.updateParticles();
      }
    });
  }
}
