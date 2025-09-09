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

  //　pixiの初期化
  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  //　パーティクルシステムの生成
  const particleSystem = new ParticleSystem(pixiApp, {
    text: "Hello World",
    font: {
      size: "150px",
      family: "Noto Sans JP",
      weight: 700,
    },
    density: 6,
    scale: 1.5,
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

  // フィルター適応
  const filterManager = new MetaballFilter(pixiApp, {
    blur: 0,
    threshold: 0,
    breakpoints: {
      768: {
        blur: 0,
        threshold: 0,
      },
    },
  });
}

init();
