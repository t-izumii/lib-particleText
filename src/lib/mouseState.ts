import { getScrollPosition } from "./ScrollManager";
import { PARTICLE_CONSTANTS } from "../particle-system/constants";

export interface MousePosition {
  x: number;
  y: number;
}

class MouseStateManager {
  private position: MousePosition = { x: 0, y: 0 };
  private isInitialized = false;
  private isTouch = false; // タッチ操作中かどうか

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    if (this.isInitialized) return;

    // マウスイベント（デスクトップ）
    window.addEventListener("mousemove", (event) => {
      if (!this.isTouch) {
        // タッチ中でない場合のみマウスを処理
        this.position.x = event.clientX;
        this.position.y = event.clientY;
      }
    });

    // タッチイベント（スマホ/タブレット）
    window.addEventListener(
      "touchstart",
      (event) => {
        this.isTouch = true;
        if (event.touches.length > 0) {
          this.position.x = event.touches[0].clientX;
          this.position.y = event.touches[0].clientY;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        this.isTouch = true;
        if (event.touches.length > 0) {
          this.position.x = event.touches[0].clientX;
          this.position.y = event.touches[0].clientY;
        }
        // preventDefaultは特定の状況でのみ呼び出す
        if (event.target instanceof HTMLCanvasElement) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    window.addEventListener(
      "touchend",
      (event) => {
        // 最後のタッチが終了したらリセット
        if (event.touches.length === 0) {
          this.isTouch = false;
          // 座標を画面外に移動（エフェクトを停止）
          this.position.x = PARTICLE_CONSTANTS.TOUCH_END_POSITION;
          this.position.y = PARTICLE_CONSTANTS.TOUCH_END_POSITION;
        }
      },
      { passive: true }
    );

    // タッチがキャンセルされた場合もリセット
    window.addEventListener(
      "touchcancel",
      () => {
        this.isTouch = false;
        this.position.x = PARTICLE_CONSTANTS.TOUCH_END_POSITION;
        this.position.y = PARTICLE_CONSTANTS.TOUCH_END_POSITION;
      },
      { passive: true }
    );

    this.isInitialized = true;
  }

  /**
   * 現在のグローバルマウス座標を取得
   */
  getGlobalPosition(): MousePosition {
    return { ...this.position };
  }

  /**
   * 指定要素に対する相対座標を取得
   */
  getElementRelativePosition(element: HTMLElement): MousePosition {
    const rect = element.getBoundingClientRect();
    const scroll = getScrollPosition();
    return {
      x: this.position.x - rect.left - scroll.x,
      y: this.position.y - rect.top - scroll.y,
    };
  }
}

// シングルトンインスタンス
export const mouseState = new MouseStateManager();
