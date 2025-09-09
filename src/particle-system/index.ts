import * as PIXI from "pixi.js";
import { TextureGenerator } from "./TextureGenerator";
import { ParticleManager } from "./ParticleManager";
import { MouseInteraction } from "./MouseInteraction";
import { mouseState } from "../lib/mouseState";
import { PARTICLE_CONSTANTS } from "./constants";
import { getResponsiveOptions, type ResponsiveOptions } from "./utils";

export interface FontOptions {
  size?: string;
  family?: string;
  weight?: string | number;
}

export interface ParticleSystemOptions extends ResponsiveOptions {
  text?: string;
  imageSrc?: string;
  imgWidth?: number;
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
    this.options = getResponsiveOptions(this.baseOptions);

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
    try {
      // パーティクル画像を読み込み（固定パス）
      this.particleTexture = await PIXI.Assets.load("./particle.png");
    } catch (error) {
      console.error("Failed to load particle texture:", error);
      // フォールバック: 単色の矩形テクスチャを作成
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0x000000);
      graphics.drawRect(0, 0, PARTICLE_CONSTANTS.DEFAULT_PARTICLE_SIZE, PARTICLE_CONSTANTS.DEFAULT_PARTICLE_SIZE);
      graphics.endFill();
      this.particleTexture = this.pixiApp.renderer.generateTexture(graphics);
    }

    let particles: { x: number; y: number }[];

    // テキストまたは画像からパーティクル座標を生成
    if (this.options.imageSrc) {
      // 画像からパーティクル座標を生成
      particles = await this.textureGenerator.generateFromImage(
        this.options.imageSrc,
        this.options.density!,
        this.pixiApp.screen.width,
        this.pixiApp.screen.height,
        this.options.imgWidth
      );
    } else {
      // テキストからパーティクル座標を生成
      particles = this.textureGenerator.generateFromText(
        this.options.text!,
        this.fontToString(this.options.font!),
        this.options.density!,
        this.pixiApp.screen.width,
        this.pixiApp.screen.height
      );
    }

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
   * リサイズ時のクリーンアップ処理
   */
  private cleanupBeforeResize(): void {
    if (this.particleManager) {
      this.particleManager.cleanup();
    }
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

    // リサイズ前にクリーンアップ
    this.cleanupBeforeResize();

    // breakpoint設定を再適用
    this.options = getResponsiveOptions(this.baseOptions);

    // テキストまたは画像からパーティクル座標を再生成
    let particles: { x: number; y: number }[] | Promise<{ x: number; y: number }[]>;
    
    if (this.options.imageSrc) {
      particles = this.textureGenerator.generateFromImage(
        this.options.imageSrc,
        this.options.density!,
        newWidth,
        newHeight,
        this.options.imgWidth
      );
    } else {
      particles = this.textureGenerator.generateFromText(
        this.options.text!,
        this.fontToString(this.options.font!),
        this.options.density!,
        newWidth,
        newHeight
      );
    }

    // Promiseの場合とそうでない場合を処理
    if (particles instanceof Promise) {
      particles.then((resolvedParticles) => {
        this.particleManager.updateOptions(this.options);
        this.particleManager.renderParticles(resolvedParticles, this.pixiApp.stage);
      });
    } else {
      this.particleManager.updateOptions(this.options);
      this.particleManager.renderParticles(particles, this.pixiApp.stage);
    }

    // マウスインタラクションの設定も更新
    this.mouseInteraction.updateSettings({
      repelRadius: this.options.mouseRadius!,
      repelForce: this.options.mouseForce!,
      returnForce: this.options.returnForce!,
      friction: this.options.friction!,
    });
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

  /**
   * リソースをクリーンアップ
   */
  cleanup(): void {
    // イベントリスナーを削除
    window.removeEventListener("resize", this.resize.bind(this));
    
    // パーティクルマネージャーをクリーンアップ
    if (this.particleManager) {
      this.particleManager.cleanup();
    }
    
    // PIXIアプリケーションのティッカーを停止
    if (this.pixiApp && this.pixiApp.ticker) {
      this.pixiApp.ticker.stop();
    }
  }

  /**
   * 完全な破棄（コンポーネント終了時用）
   */
  destroy(): void {
    this.cleanup();
    
    if (this.particleManager) {
      this.particleManager.destroy();
    }
    
    // PIXIアプリケーションを破棄
    if (this.pixiApp) {
      this.pixiApp.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true
      });
    }
  }
}
