import * as PIXI from "pixi.js";
import type { ParticleData } from "./MouseInteraction";
import { PARTICLE_CONSTANTS, DEFAULT_PARTICLE_OPTIONS } from "./constants";

export interface ParticleOptions {
  anchor?: number;
  scale?: number;
  tint?: number;
}

class Particle {
  public sprite: PIXI.Sprite;
  public data: ParticleData;

  constructor(
    position: { x: number; y: number },
    texture: PIXI.Texture,
    options?: ParticleOptions
  ) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = position.x;
    this.sprite.y = position.y;
    this.sprite.anchor.set(options?.anchor ?? DEFAULT_PARTICLE_OPTIONS.anchor);
    this.sprite.scale.set((options?.scale ?? DEFAULT_PARTICLE_OPTIONS.scale) / PARTICLE_CONSTANTS.SCALE_DIVISOR);
    this.sprite.tint = options?.tint ?? DEFAULT_PARTICLE_OPTIONS.tint;

    // パーティクルデータを初期化
    this.data = {
      x: position.x,
      y: position.y,
      vx: 0,
      vy: 0,
      originalX: position.x,
      originalY: position.y,
    };
  }

  /**
   * パーティクルの位置を更新
   */
  updatePosition(): void {
    this.sprite.x = this.data.x;
    this.sprite.y = this.data.y;
  }
}

export class ParticleManager {
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer;
  private texture: PIXI.Texture;
  private options: ParticleOptions;

  constructor(
    texture: PIXI.Texture,
    options: ParticleOptions = {}
  ) {
    this.texture = texture;
    this.options = options;
  }

  renderParticles(
    positions: { x: number; y: number }[],
    stage: PIXI.Container
  ): void {
    if (!Array.isArray(positions)) {
      console.error('positions is not an array:', positions);
      return;
    }

    // 既存のリソースを適切にクリーンアップ
    this.cleanup();

    const maxParticles = PARTICLE_CONSTANTS.MAX_PARTICLES;
    const limitedPositions = positions.slice(0, maxParticles);

    this.container = new PIXI.ParticleContainer(maxParticles);

    for (const position of limitedPositions) {
      const particle = new Particle(position, this.texture, this.options);
      this.particles.push(particle);
      this.container.addChild(particle.sprite);
    }

    stage.addChild(this.container);
  }

  /**
   * パーティクルデータを取得（マウスインタラクション用）
   */
  getParticleStates(): ParticleData[] {
    return this.particles.map((particle) => particle.data);
  }

  /**
   * パーティクル位置を更新
   */
  updateParticlePositions(): void {
    this.particles.forEach((particle) => {
      particle.updatePosition();
    });
  }

  /**
   * オプションを更新
   */
  updateOptions(options: ParticleOptions): void {
    this.options = { ...this.options, ...options };
    // 既存のパーティクルの見た目を更新
    this.particles.forEach((particle) => {
      particle.sprite.anchor.set(this.options.anchor ?? DEFAULT_PARTICLE_OPTIONS.anchor);
      particle.sprite.scale.set(this.options.scale ?? DEFAULT_PARTICLE_OPTIONS.scale);
      particle.sprite.tint = this.options.tint ?? DEFAULT_PARTICLE_OPTIONS.tint;
    });
  }

  /**
   * リソースをクリーンアップ
   */
  cleanup(): void {
    if (this.container) {
      // 各パーティクルのテクスチャを適切に破棄
      this.particles.forEach(particle => {
        if (particle.sprite.texture && particle.sprite.texture.baseTexture) {
          // カスタムテクスチャの場合のみ破棄（共有テクスチャは破棄しない）
          if (particle.sprite.texture !== this.texture) {
            particle.sprite.texture.destroy();
          }
        }
        particle.sprite.destroy();
      });
      
      this.container.destroy({
        children: true,
        texture: false, // 共有テクスチャは保持
        baseTexture: false
      });
      this.container = undefined;
      this.particles = [];
    }
  }

  /**
   * 完全なリソース破棄（コンポーネント終了時用）
   */
  destroy(): void {
    this.cleanup();
    // メインテクスチャも破棄する場合（使用時は注意）
    // if (this.texture && !this.texture.baseTexture.destroyed) {
    //   this.texture.destroy();
    // }
  }
}
