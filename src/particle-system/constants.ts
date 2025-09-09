/**
 * パーティクルシステムの定数定義
 */

export const PARTICLE_CONSTANTS = {
  // ParticlePositionExtractor 関連
  HEX_GRID_OFFSET: 6, // 六角格子の偶数行オフセット
  
  // ParticleManager 関連
  MAX_PARTICLES: 100000, // 最大パーティクル数
  DEFAULT_PARTICLE_SIZE: 4, // フォールバック用パーティクルサイズ
  SCALE_DIVISOR: 10, // スケール計算の除数
  
  // デフォルト値
  DEFAULT_ANCHOR: 0.5,
  DEFAULT_SCALE: 1,
  DEFAULT_TINT: 0x000000,
  
  // マウスインタラクション関連
  TOUCH_END_POSITION: -1000, // タッチ終了時の画面外座標
  
  // テクスチャ生成関連
  CANVAS_RGBA_ALPHA_INDEX: 3, // RGBAデータのアルファ値インデックス
} as const;

export const DEFAULT_PARTICLE_OPTIONS = {
  anchor: PARTICLE_CONSTANTS.DEFAULT_ANCHOR,
  scale: PARTICLE_CONSTANTS.DEFAULT_SCALE,
  tint: PARTICLE_CONSTANTS.DEFAULT_TINT,
} as const;