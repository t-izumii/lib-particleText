import * as PIXI from "pixi.js";
import { TextureGenerator } from "./createTexture";
import { createParticle } from "./createParticle";

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

  constructor(pixiApp: PIXI.Application) {
    this.textureGenerator = new TextureGenerator();
    this.pixiApp = pixiApp;

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
}
