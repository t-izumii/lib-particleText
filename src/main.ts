import { PixiApp } from "./particle-system/setUpPixi";
import { ParticleSystem } from "./particle-system/index";
import { FilterManager } from "./filter/blurFilter";
import { GoogleFontsLoader } from "./lib/fontloader";

async function init() {
  // Noto Sansフォントを読み込み
  await GoogleFontsLoader.loadFont({
    familyName: "Noto Sans JP",
    weights: ["700"],
    subsets: ["latin", "japanese"],
  });

  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  const particleSystem = new ParticleSystem(pixiApp, {
    text: "Hello World",
    font: {
      size: "150px",
      family: "Noto Sans JP",
      weight: 700,
    },
    density: 5,
    scale: 1.3,
    tint: 0x000000,
    mouseRadius: 100,
    breakpoints: {
      768: {
        density: 3,
        scale: 0.8,
        font: {
          size: "60px",
        },
      },
    },
  });

  // stageにフィルターを適用
  pixiApp.stage.filters = [
    new FilterManager().getBlurFilter(1),
    new FilterManager().getThresholdFilter(0.5),
  ];
  pixiApp.stage.filterArea = pixiApp.renderer.screen;
}

init();
