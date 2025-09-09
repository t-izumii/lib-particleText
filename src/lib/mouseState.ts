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
      if (!this.isTouch) { // タッチ中でない場合のみマウスを処理
        this.position.x = event.clientX;
        this.position.y = event.clientY;
      }
    });

    // タッチイベント（スマホ/タブレット）
    window.addEventListener("touchstart", (event) => {
      this.isTouch = true;
      if (event.touches.length > 0) {
        this.position.x = event.touches[0].clientX;
        this.position.y = event.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchmove", (event) => {
      this.isTouch = true;
      if (event.touches.length > 0) {
        this.position.x = event.touches[0].clientX;
        this.position.y = event.touches[0].clientY;
      }
      // preventDefaultは特定の状況でのみ呼び出す
      if (event.target instanceof HTMLCanvasElement) {
        event.preventDefault();
      }
    }, { passive: false });

    window.addEventListener("touchend", (event) => {
      // 最後のタッチが終了したらリセット
      if (event.touches.length === 0) {
        this.isTouch = false;
        // 座標を画面外に移動（エフェクトを停止）
        this.position.x = -1000;
        this.position.y = -1000;
      }
    }, { passive: true });

    // タッチがキャンセルされた場合もリセット
    window.addEventListener("touchcancel", (event) => {
      this.isTouch = false;
      this.position.x = -1000;
      this.position.y = -1000;
    }, { passive: true });

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
    return {
      x: this.position.x - rect.left,
      y: this.position.y - rect.top
    };
  }

  /**
   * マウス座標を手動で設定（テスト用）
   */
  setGlobalPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * 現在タッチ中かどうかを取得
   */
  getIsTouchActive(): boolean {
    return this.isTouch;
  }
}

// シングルトンインスタンス
export const mouseState = new MouseStateManager();