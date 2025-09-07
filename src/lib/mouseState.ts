export interface MousePosition {
  x: number;
  y: number;
}

class MouseStateManager {
  private position: MousePosition = { x: 0, y: 0 };
  private isInitialized = false;

  constructor() {
    this.initializeMouseTracking();
  }

  private initializeMouseTracking(): void {
    if (this.isInitialized) return;

    window.addEventListener("mousemove", (event) => {
      this.position.x = event.clientX;
      this.position.y = event.clientY;
    });

    this.isInitialized = true;
  }

  /**
   * 現在のマウス座標を取得
   */
  getPosition(): MousePosition {
    return { ...this.position };
  }

  /**
   * 指定要素に対する相対座標を取得
   */
  getRelativePosition(element: HTMLElement): MousePosition {
    const rect = element.getBoundingClientRect();
    return {
      x: this.position.x - rect.left,
      y: this.position.y - rect.top
    };
  }

  /**
   * マウス座標を手動で設定（テスト用）
   */
  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }
}

// シングルトンインスタンス
export const mouseState = new MouseStateManager();