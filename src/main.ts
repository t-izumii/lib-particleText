import { PixiApp } from "./particle-system/setUpPixi";
import { ParticleSystem } from "./particle-system/index";
import { FilterManager } from "./filter/blurFilter";

async function init() {
  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  const particleSystem = new ParticleSystem(pixiApp, {
    text: "test",
    font: {
      size: "200px",
      family: "Arial",
      weight: 400, // 数値で指定する場合
    },
    density: 4,
    scale: 2,
    tint: 0x0000ff,
    mouseRadius: 100,
    breakpoints: {
      768: {
        font: {
          size: "100px",
        },
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
