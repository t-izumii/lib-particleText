import { PixiApp } from "./particle-system/PixiSetup";
import { ParticleSystem } from "./particle-system/index";
import { MetaballFilter } from "./filter/metaballFilter";
import { GoogleFontsLoader } from "./lib/fontloader";

async function init() {
  // Noto Sansフォントを読み込み
  await GoogleFontsLoader.loadGoogleFont({
    familyName: "Noto Sans JP",
    weights: ["700"],
    subsets: ["latin", "japanese"],
  });

  //　pixiの初期化
  const app1 = new PixiApp(".js-ParticleText");
  const pixiApp1 = app1.getApp();

  //　パーティクルシステムの生成
  new ParticleSystem(pixiApp1, {
    text: "Hello World",
    font: {
      size: "150px",
      family: "Noto Sans JP",
      weight: 700,
    },
    density: 6,
    scale: 1.5,
    tint: 0x000000,
    mouseRadius: 60,
    breakpoints: {
      768: {
        density: 3,
        scale: 0.8,
        mouseRadius: 20,
        font: {
          size: "60px",
        },
      },
    },
  });

  // フィルター適応
  new MetaballFilter(pixiApp1, {
    blur: 6,
    threshold: 0.4,
    breakpoints: {
      768: {
        blur: 0,
        threshold: 0,
      },
    },
  });

  const app2 = new PixiApp(".js-ParticleImage");
  const pixiApp2 = app2.getApp();

  // 画像パーティクルシステムの生成
  new ParticleSystem(pixiApp2, {
    imageSrc: "./image.png",
    imgWidth: 500,
    density: 4,
    scale: 1.0,
    tint: 0x0066ff,
    mouseRadius: 60,
    breakpoints: {
      768: {
        imgWidth: 300,
        density: 2,
        scale: 0.6,
        mouseRadius: 20,
      },
    },
  });
}

init();
