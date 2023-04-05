export type IBaseMapType = {
  id: string;
  thumbnailUrl: string;
  text: string;
  display: boolean;
  baseMapLayers: [IBaseMapLayers];
};

export type IBaseMapLayers = {
  id: string;
  url: string;
  layerType: string;
  title: string;
  showLegend: boolean;
  visibility: boolean;
  opacity: number;
  templateUrl?: string;
};

export type IMapLoaction = {
  long: string;
  lat: string;
  height: string;
};

export type ISelectLayer = {
  title: string;
  key: string;
  url: string;
  children: any[];
};

export type MarkBook = {
  height: number;
  longitude: number;
  latitude: number;
  heading: number;
  pitch: number;
  roll: number;
  image: any;
  title: string;
};
