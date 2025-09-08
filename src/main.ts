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

  // stageにフィルターを適用
  pixiApp.stage.filters = [
    new FilterManager().getBlurFilter(),
    new FilterManager().getThresholdFilter(),
  ];
  pixiApp.stage.filterArea = pixiApp.renderer.screen;
}

init();
