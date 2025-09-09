import * as PIXI from "pixi.js";
import type { ParticleData } from "./MouseInteraction";

class Particle {
  public sprite: PIXI.Sprite;
  public data: ParticleData;

  constructor(
    position: { x: number; y: number },
    texture: PIXI.Texture,
    options?: any
  ) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = position.x;
    this.sprite.y = position.y;
    this.sprite.anchor.set(options?.anchor || 0.5);
    this.sprite.scale.set(options?.scale / 10 || 0.1);
    this.sprite.tint = options?.tint || 0x000000;

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
  private canvas?: HTMLCanvasElement;
  private options: any;

  constructor(
    texture: PIXI.Texture,
    options?: any,
    canvas?: HTMLCanvasElement
  ) {
    this.texture = texture;
    this.options = options || {};
    this.canvas = canvas;
  }

  renderParticles(
    positions: { x: number; y: number }[],
    stage: PIXI.Container
  ): void {
    if (this.container) {
      this.container.destroy();
      this.particles = [];
    }

    const maxParticles = 100000;
    const limitedPositions = positions.slice(0, maxParticles);

    this.container = new PIXI.ParticleContainer(maxParticles); // ParticleContainerからContainerに変更

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
  updateOptions(options: any): void {
    this.options = options;
    // 既存のパーティクルの見た目を更新
    this.particles.forEach((particle) => {
      particle.sprite.anchor.set(options?.anchor || 0.5);
      particle.sprite.scale.set(options?.scale || 0.1);
      particle.sprite.tint = options?.tint || 0x000000;
    });
  }
}
