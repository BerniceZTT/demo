import type * as Cesium from 'cesium';

export interface GraphicLayerOptions {
  id: string;
}

export interface ViewProps {
  lon?: number;
  lat?: number;
  alt?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  range?: number;
}

export interface HeatMapProps {
  xy: HeatMapLayerData[];
  valueMax: number;
}

/**
 * 散点图
 */
export interface ScatterData {
  name: string;
  value: number[];
}

/**
 * 粒子
 */
export interface FlameParticle {
  position: Cesium.Cartesian3;
  image?: string;
  startColor?: Cesium.Color;
  endColor?: Cesium.Color;
  startScale?: number;
  endScale?: number;
  minimumParticleLife?: number;
  maximumParticleLife?: number;
  minimumSpeed?: number;
  maximumSpeed?: number;
  imageSize?: number | Cesium.Cartesian2;
  emissionRate?: number;
  lifetime?: number;
  emitter?: number;
  tx: any;
  ty: any;
  tz: any;
}

export interface GraphicsRotate {
  entity: Cesium.Entity.ConstructorOptions;
  rotateAmount: number;
  position: Common.Position1 | Common.Position;
}

export interface DynamicCricle {
  circle: { lng: number, lat: number, alt: number },
  imge?: string;
  color?: Cesium_.Color | string,
  count?: number,
  gradient?: number,
  radius?: number,
  height?: number,
}

export interface GraphicsFloat {
  entity: Cesium.Entity.ConstructorOptions;
  minHeiht?: number;
  maxHeiht?: number;
  cartesians: Cesium.Cartesian3;
  speed?: number;
}

export interface GifBGraphics extends Cesium.BillboardGraphics.ConstructorOptions {
  speed?: number;
  url: string;
  position: Cesium.Cartesian3;
}

export interface DynamicBlinkCircleGraphics {
  position: Cesium.Cartesian3;
  semiMinorAxis?: Cesium.Property | number;
  semiMajorAxis?: Cesium.Property | number;
  alp?: number;
  flog?: number;
  height?: Cesium.Property | number;
}

export interface ModelGraphics extends Cesium.ModelGraphics.ConstructorOptions {
  position: Cesium.Cartesian3;
}

export interface DynamicCricleGraphics {
  center: Common.Position;
  radius?: number;
  rotateAmount?: number;
  height?: number;
  scale?: number;
  scale2?: number;
  imge?: string;
  material?: any;
}

export interface PolygonGraphics extends Cesium.PolygonGraphics.ConstructorOptions {
  positions: Cesium.Cartesian3;
}

export interface MaterialWallGraphics extends Cesium.WallGraphics.ConstructorOptions {
  image: string;
  width: number;
  color?: Cesium.Color;
  duration?: number;
  freely?: any;
  positions: Cesium.Cartesian3[];
  colorTime?: number;
}
export interface FlyLines {
  /**
   * 区域范围(起始经度，起始纬度，终止经度，终止纬度)
   */
  bbox: number[];
  color: string;
  width: number;
  height: number;
  speed: number;
  /**
   * 尾巴拖多长
   */
  percent: number;
  /**
   * 变化率
   */
  gradient: number;
  /**
   * 范围内生成点数据量
   */
  random: number;
}


interface PathRoamimg {
  paths: { lat: number, lon: number, alt: number, time?: number }[],
  step?: number;
  name?: string;
  startTime?: any;
  stopTime?: any;
  multiplier?: number; //时间速率
  clockRange?: Cesium.ClockRange;
  times?: number;
  label?: Cesium.LabelGraphics.ConstructorOptions,
  polyline?: Cesium.PolylineGraphics.ConstructorOptions,
  model: Cesium.ModelGraphics.ConstructorOptions,
  billboard?: Cesium.BillboardGraphics.ConstructorOptions
  firstView?: boolean;
  up?: number,
  down?: number,
  backward?: number
}
