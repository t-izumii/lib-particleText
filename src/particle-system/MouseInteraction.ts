export interface MousePosition {
  x: number;
  y: number;
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
  private mousePosition: MousePosition = { x: 0, y: 0 };
  private repelRadius: number;
  private repelForce: number;
  private returnForce: number;
  private friction: number;

  constructor(
    repelRadius: number = 100,
    repelForce: number = 0.5,
    returnForce: number = 0.02,
    friction: number = 0.95
  ) {
    this.repelRadius = repelRadius;
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
   * パーティクルにマウス干渉を適用
   */
  applyMouseInteraction(particles: ParticleData[]): void {
    particles.forEach(particle => {
      // マウスからパーティクルへの距離を計算
      const dx = particle.x - this.mousePosition.x;
      const dy = particle.y - this.mousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // マウスが反発範囲内にある場合
      if (distance < this.repelRadius && distance > 0) {
        // 正規化した方向ベクトル
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        // 距離に基づく反発力（近いほど強い）
        const force = (this.repelRadius - distance) / this.repelRadius * this.repelForce;

        // 速度に反発力を加算
        particle.vx += normalizedX * force;
        particle.vy += normalizedY * force;
      }

      // 元の位置に戻る力
      const returnDx = particle.originalX - particle.x;
      const returnDy = particle.originalY - particle.y;
      
      particle.vx += returnDx * this.returnForce;
      particle.vy += returnDy * this.returnForce;

      // 摩擦を適用
      particle.vx *= this.friction;
      particle.vy *= this.friction;

      // 位置を更新
      particle.x += particle.vx;
      particle.y += particle.vy;
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
    if (settings.repelRadius !== undefined) this.repelRadius = settings.repelRadius;
    if (settings.repelForce !== undefined) this.repelForce = settings.repelForce;
    if (settings.returnForce !== undefined) this.returnForce = settings.returnForce;
    if (settings.friction !== undefined) this.friction = settings.friction;
  }

  /**
   * 現在のマウス座標を取得
   */
  getMousePosition(): MousePosition {
    return { ...this.mousePosition };
  }
}