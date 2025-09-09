export interface MousePosition {
  x: number;
  y: number;
  radius: number;
}

export interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originalX: number;
  originalY: number;
}

export class MouseInteraction {
  private mousePosition: MousePosition = { x: 0, y: 0, radius: 100 };
  private repelForce: number;
  private returnForce: number;
  private friction: number;

  constructor(
    repelRadius: number = 100,
    repelForce: number = 0.5,
    returnForce: number = 0.02,
    friction: number = 0.95
  ) {
    this.mousePosition.radius = repelRadius;
    this.repelForce = repelForce;
    this.returnForce = returnForce;
    this.friction = friction;
  }

  /**
   * マウス座標を更新
   */
  updateMousePosition(x: number, y: number): void {
    this.mousePosition.x = x;
    this.mousePosition.y = y;
  }

  /**
   * マウスとパーティクルの距離を計算
   */
  private calculateDistance(particle: ParticleData): number {
    const dx = this.mousePosition.x - particle.x;
    const dy = this.mousePosition.y - particle.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * study-10のロジックに基づく反発力計算
   */
  private calculateRepulsionForce(particle: ParticleData): { x: number; y: number } {
    const dx = this.mousePosition.x - particle.x;
    const dy = this.mousePosition.y - particle.y;
    const dist = this.calculateDistance(particle);

    if (dist < this.mousePosition.radius && dist > 0) {
      // マウスからパーティクルへの角度を計算
      const angle = Math.atan2(dy, dx);

      // 反発後の目標位置を計算
      const tx = particle.x + Math.cos(angle) * this.mousePosition.radius;
      const ty = particle.y + Math.sin(angle) * this.mousePosition.radius;

      // 反発ベクトルを計算
      const ax = tx - this.mousePosition.x;
      const ay = ty - this.mousePosition.y;

      return { x: ax, y: ay };
    }

    return { x: 0, y: 0 };
  }

  /**
   * 復元力を適用（元の位置に戻ろうとする力）
   */
  private applyRestoreForce(particle: ParticleData): void {
    particle.vx += (particle.originalX - particle.x) * this.returnForce;
    particle.vy += (particle.originalY - particle.y) * this.returnForce;
  }

  /**
   * 摩擦力を適用（速度を減衰させる）
   */
  private applyFriction(particle: ParticleData): void {
    particle.vx *= this.friction;
    particle.vy *= this.friction;
  }

  /**
   * 位置を更新（速度に基づいて位置を移動）
   */
  private updatePosition(particle: ParticleData): void {
    particle.x += particle.vx;
    particle.y += particle.vy;
  }

  /**
   * パーティクルにマウス干渉を適用（study-10のロジック）
   */
  applyMouseInteraction(particles: ParticleData[]): void {
    particles.forEach((particle) => {
      // 1. マウス反発力の計算と適用
      const repulsionForce = this.calculateRepulsionForce(particle);
      if (repulsionForce.x !== 0 || repulsionForce.y !== 0) {
        // study-10と同じく減算で適用
        particle.vx -= repulsionForce.x;
        particle.vy -= repulsionForce.y;
      }

      // 2. 復元力の適用（元の位置に戻ろうとする力）
      this.applyRestoreForce(particle);

      // 3. 摩擦力の適用（速度を減衰させる）
      this.applyFriction(particle);

      // 4. 位置の更新（速度に基づいて位置を移動）
      this.updatePosition(particle);
    });
  }

  /**
   * 設定値を更新
   */
  updateSettings(settings: {
    repelRadius?: number;
    repelForce?: number;
    returnForce?: number;
    friction?: number;
  }): void {
    if (settings.repelRadius !== undefined)
      this.mousePosition.radius = settings.repelRadius;
    if (settings.repelForce !== undefined)
      this.repelForce = settings.repelForce;
    if (settings.returnForce !== undefined)
      this.returnForce = settings.returnForce;
    if (settings.friction !== undefined) 
      this.friction = settings.friction;
  }

  /**
   * 現在のマウス座標を取得
   */
  getMousePosition(): MousePosition {
    return { ...this.mousePosition };
  }
}
