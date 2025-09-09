import * as PIXI from "pixi.js";

export class PixiApp {
  private app!: PIXI.Application;
  private element: Element;

  constructor(selector: string) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element ${selector} not found`);
    this.element = el;

    this.init();
  }

  init() {
    const rect = this.element.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
    });

    this.element.appendChild(this.app.view as HTMLCanvasElement);

    this.setEventListener();
  }

  getApp(): PIXI.Application {
    return this.app;
  }

  setEventListener() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize(): void {
    if (!this.app) return;

    const rect = this.element.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    this.app.renderer.resize(width, height);
  }

  /**
   * リソースをクリーンアップ
   */
  cleanup(): void {
    window.removeEventListener("resize", this.resize.bind(this));
  }

  /**
   * 完全な破棄（コンポーネント終了時用）
   */
  destroy(): void {
    this.cleanup();
    if (this.app) {
      this.app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true
      });
    }
  }
}
