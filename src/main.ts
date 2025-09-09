import { PixiApp } from "./particle-system/PixiSetup";
import { ParticleSystem } from "./particle-system/index";
import { MetaballFilter } from "./filter/MetaballFilter";
import { GoogleFontsLoader } from "./lib/FontLoader";

async function init() {
  // Noto Sansフォントを読み込み
  await GoogleFontsLoader.loadGoogleFont({
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

  // MetaballFilterでbreakpointsとフィルター適用を完全管理
  const filterManager = new MetaballFilter(pixiApp, {
    blur: 3, // デスクトップのデフォルト値
    threshold: 0.7, // デスクトップのデフォルト値
    breakpoints: {
      768: {
        blur: 0, // 768px以下の時の値
        threshold: 0.3, // 768px以下の時の値
      },
    },
  });
}

init();
