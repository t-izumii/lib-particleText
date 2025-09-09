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
    text: "Hello",
    font: {
      size: "200px",
      family: "Noto Sans JP",
      weight: 700,
    },
    density: 5,
    scale: 1.3,
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
