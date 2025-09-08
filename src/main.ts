import { PixiApp } from "./particle-system/setUpPixi";
import { ParticleSystem } from "./particle-system/index";
import { FilterManager } from "./filter/blurFilter";

async function init() {
  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  const particleSystem = new ParticleSystem(pixiApp, {
    text: "test",
    font: "200px Arial",
    density: 4,
    scale: 0.08,
    tint: 0x0000ff,
    mouseRadius: 10,
    breakpoints: {
      768: {
        font: "150px Arial",
        scale: 0.06,
        density: 6,
      },
    },
  });

  // stageにフィルターを適用
  pixiApp.stage.filters = [
    new FilterManager().getBlurFilter(),
    new FilterManager().getThresholdFilter(),
  ];
  pixiApp.stage.filterArea = pixiApp.renderer.screen;
}

init();
