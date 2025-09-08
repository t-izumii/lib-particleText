import * as PIXI from "pixi.js";
import type { ParticleData } from "../mouseEvent/MouseInteraction";

class Particle {
  public sprite: PIXI.Sprite;
  public data: ParticleData;

  constructor(position: { x: number; y: number }, texture: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = position.x;
    this.sprite.y = position.y;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.1);
    this.sprite.tint = 0x000000; // 黒色に変更

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

export class createParticle {
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer; // ParticleContainerからContainerに変更
  private texture: PIXI.Texture;
  private canvas?: HTMLCanvasElement;

  constructor(texture: PIXI.Texture, canvas?: HTMLCanvasElement) {
    this.texture = texture;
    this.canvas = canvas;
  }

  createParticles(
    positions: { x: number; y: number }[],
    stage: PIXI.Container
  ): void {
    if (this.container) {
      this.container.destroy();
      this.particles = [];
    }

    const maxParticles = 100000;
    const limitedPositions = positions.slice(0, maxParticles);

    this.container = new PIXI.ParticleContainer(); // ParticleContainerからContainerに変更

    for (const position of limitedPositions) {
      const particle = new Particle(position, this.texture);
      this.particles.push(particle);
      this.container.addChild(particle.sprite);
    }

    stage.addChild(this.container);
  }

  /**
   * パーティクルデータを取得（マウスインタラクション用）
   */
  getParticleData(): ParticleData[] {
    return this.particles.map((particle) => particle.data);
  }

  /**
   * パーティクル位置を更新
   */
  updateParticles(): void {
    this.particles.forEach((particle) => {
      particle.updatePosition();
    });
  }
}
