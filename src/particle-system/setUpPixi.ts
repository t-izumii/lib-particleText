import * as PIXI from "pixi.js";

export class PixiApp {
  private app: PIXI.Application;

  constructor(selector: string) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element ${selector} not found`);

    const rect = element.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
    });

    element.appendChild(this.app.view as HTMLCanvasElement);
  }

  getApp(): PIXI.Application {
    return this.app;
  }
}
