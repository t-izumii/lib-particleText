export interface ScrollPosition {
  x: number;
  y: number;
}

export interface ScrollCallbackData {
  position: ScrollPosition;
  direction: {
    x: "left" | "right" | "none";
    y: "up" | "down" | "none";
  };
  delta: {
    x: number;
    y: number;
  };
}

export type ScrollCallback = (data: ScrollCallbackData) => void;

export class ScrollManager {
  private position: ScrollPosition = { x: 0, y: 0 };
  private previousPosition: ScrollPosition = { x: 0, y: 0 };
  private callbacks: ScrollCallback[] = [];
  private isListening = false;

  constructor() {
    this.updatePosition();
  }

  /**
   * 現在のスクロール位置を更新
   */
  private updatePosition(): void {
    this.previousPosition = { ...this.position };
    this.position = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };
  }

  /**
   * スクロール方向を計算
   */
  private getDirection(): ScrollCallbackData["direction"] {
    const deltaX = this.position.x - this.previousPosition.x;
    const deltaY = this.position.y - this.previousPosition.y;

    return {
      x: deltaX > 0 ? "right" : deltaX < 0 ? "left" : "none",
      y: deltaY > 0 ? "down" : deltaY < 0 ? "up" : "none",
    };
  }

  /**
   * スクロール差分を計算
   */
  private getDelta(): ScrollCallbackData["delta"] {
    return {
      x: this.position.x - this.previousPosition.x,
      y: this.position.y - this.previousPosition.y,
    };
  }

  /**
   * スクロールイベントハンドラー
   */
  private handleScroll = (): void => {
    this.updatePosition();

    const callbackData: ScrollCallbackData = {
      position: { ...this.position },
      direction: this.getDirection(),
      delta: this.getDelta(),
    };

    this.callbacks.forEach((callback) => callback(callbackData));
  };

  /**
   * スクロール監視を開始
   */
  startListening(): void {
    if (this.isListening) return;

    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.isListening = true;
  }

  /**
   * スクロール監視を停止
   */
  stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener("scroll", this.handleScroll);
    this.isListening = false;
  }

  /**
   * コールバック関数を追加
   */
  addCallback(callback: ScrollCallback): void {
    this.callbacks.push(callback);

    // 初回監視開始
    if (!this.isListening) {
      this.startListening();
    }
  }

  /**
   * コールバック関数を削除
   */
  removeCallback(callback: ScrollCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }

    // コールバックがなくなったら監視停止
    if (this.callbacks.length === 0) {
      this.stopListening();
    }
  }

  /**
   * 全てのコールバックを削除
   */
  clearCallbacks(): void {
    this.callbacks = [];
    this.stopListening();
  }

  /**
   * 現在のスクロール位置を取得
   */
  getPosition(): ScrollPosition {
    return { ...this.position };
  }

  /**
   * 前回のスクロール位置を取得
   */
  getPreviousPosition(): ScrollPosition {
    return { ...this.previousPosition };
  }

  /**
   * 監視状態を取得
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * リソースクリーンアップ
   */
  destroy(): void {
    this.clearCallbacks();
    this.stopListening();
  }
}

// グローバルインスタンス
export const scrollManager = new ScrollManager();
