import * as PIXI from "pixi.js";
import { PixiApp } from "./particle-system/setUpPixi";
import { TextureGenerator } from "./particle-system/createTexture";
import { ParticleSystem } from "./particle-system/createParticle";
import { MouseInteraction } from "./mouseEvent/MouseInteraction";
import { mouseState } from "./lib/mouseState";
import { FilterManager } from "./filter/blurFilter";

async function init() {
  const app = new PixiApp(".js-ParticleText");
  const pixiApp = app.getApp();

  // パーティクル画像を読み込み
  const particleTexture = await PIXI.Assets.load("./particle.png");

  // TextureGeneratorを初期化
  const textureGenerator = new TextureGenerator();

  // テキストからパーティクル座標を生成
  const particles = textureGenerator.setTextWithFont(
    "HELLO", // テキスト
    "150px Arial", // フォント
    4, // 密度
    pixiApp.screen.width, // ステージ幅
    pixiApp.screen.height // ステージ高さ
  );

  // ParticleSystemを初期化してパーティクルを描画
  const particleSystem = new ParticleSystem(particleTexture);
  particleSystem.createParticles(particles, pixiApp.stage);

  // フィルターマネージャーを初期化してstageに適用
  const filterManager = new FilterManager();

  // stageにフィルターを適用（study-10と同じ方法）
  pixiApp.stage.filters = [
    filterManager.getBlurFilter(),
    filterManager.getThresholdFilter(),
  ];
  pixiApp.stage.filterArea = pixiApp.renderer.screen;

  console.log("stage.filters:", pixiApp.stage.filters);
  console.log("stage.filterArea:", pixiApp.stage.filterArea);

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
    mouseInteraction.applyMouseInteraction(particleSystem.getParticleData());

    // パーティクル位置を更新
    particleSystem.updateParticles();
  });

  console.log("Generated particles:", particles.length);
}

init();
