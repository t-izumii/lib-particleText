import * as PIXI from "pixi.js";
import { TextureGenerator } from "./createTexture";
import { createParticle } from "./createParticle";
import { MouseInteraction } from "../mouseEvent/MouseInteraction";
import { mouseState } from "../lib/mouseState";

export interface ParticleSystemOptions {
  text: string;
  font: string;
  density: number;
  particleImagePath: string;
  enableFilter?: boolean;
}

export class ParticleSystem {
  private textureGenerator: TextureGenerator;
  private createParticle!: createParticle;
  private particleTexture?: PIXI.Texture;
  private pixiApp: PIXI.Application;
  private mouseInteraction: MouseInteraction;

  constructor(pixiApp: PIXI.Application) {
    this.textureGenerator = new TextureGenerator();
    this.pixiApp = pixiApp;
    
    // マウスインタラクションを初期化
    this.mouseInteraction = new MouseInteraction(
      120, // 反発半径
      0.8, // 反発力
      0.03, // 復帰力
      0.92 // 摩擦
    );

    this.init();
  }

  /**
   * パーティクルテキストシステムを初期化
   */
  private async init(): Promise<void> {
    // パーティクル画像を読み込み
    this.particleTexture = await PIXI.Assets.load("./particle.png");

    // テキストからパーティクル座標を生成
    const particles = this.textureGenerator.setTextWithFont(
      "HELLO", // テキスト
      "150px Arial", // フォント
      8, // 密度
      this.pixiApp.screen.width, // ステージ幅
      this.pixiApp.screen.height // ステージ高さ
    );

    // ParticleSystemを初期化してパーティクルを描画
    this.createParticle = new createParticle(this.particleTexture);
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
