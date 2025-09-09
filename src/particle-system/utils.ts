/**
 * レスポンシブ設定のユーティリティ関数
 */

export interface ResponsiveOptions {
  breakpoints?: {
    [width: number]: any;
  };
}

/**
 * 現在の画面幅に応じた設定を取得
 */
export function getResponsiveOptions<T extends ResponsiveOptions>(
  baseOptions: T
): T {
  const currentWidth = window.innerWidth;
  let responsiveOptions = { ...baseOptions };

  if (baseOptions.breakpoints) {
    // breakpointsを幅の昇順でソート
    const sortedBreakpoints = Object.keys(baseOptions.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    // 現在の幅以下の最大のbreakpointを見つける
    for (const breakpoint of sortedBreakpoints) {
      if (currentWidth <= breakpoint) {
        responsiveOptions = {
          ...responsiveOptions,
          ...baseOptions.breakpoints[breakpoint],
        };
        break; // 最初に条件に合うbreakpointを適用して終了
      }
    }
  }
  return responsiveOptions;
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}