/**
 * 軽量なスクロール位置取得ユーティリティ
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  };
}
