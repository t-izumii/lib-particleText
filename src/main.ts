import * as PIXI from "pixi.js";
import { PixiApp } from "./particle-system/setUpPixi";
import { ParticleSystem } from "./particle-system/index";
import { MouseInteraction } from "./mouseEvent/MouseInteraction";
import { mouseState } from "./lib/mouseState";
import { FilterManager } from "./filter/blurFilter";

async function init() {
  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  let particleSystem = new ParticleSystem(pixiApp);

  // stageにフィルターを適用（study-10と同じ方法）
  pixiApp.stage.filters = [
    new FilterManager().getBlurFilter(),
    new FilterManager().getThresholdFilter(),
  ];
  pixiApp.stage.filterArea = pixiApp.renderer.screen;

  // マウスインタラクションを初期化
  const mouseInteraction = new MouseInteraction(
    120, // 反発半径
    0.8, // 反発力
    0.03, // 復帰力
    0.92 // 摩擦
  );

  // アニメーションループ
  pixiApp.ticker.add(() => {
    // グローバルマウス座標を取得してキャンバス相対座標に変換
    const canvas = pixiApp.view as HTMLCanvasElement;
    const relativePos = mouseState.getRelativePosition(canvas);

    // マウスインタラクションを適用
    mouseInteraction.updateMousePosition(relativePos.x, relativePos.y);
    const createParticleInstance = particleSystem.getCreateParticle();
    if (createParticleInstance) {
      mouseInteraction.applyMouseInteraction(
        createParticleInstance.getParticleData()
      );
      // パーティクル位置を更新
      createParticleInstance.updateParticles();
    }
  });
}

init();
