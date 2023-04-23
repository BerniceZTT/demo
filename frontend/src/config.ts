export const tiandituTk = '4b1cbd3b908a1be1d5ba5efb1eefa1a5';
export const config = {
  esriBasemapDefinitions: {
    streets: {
      id: 'streets',
      thumbnailUrl: require('@/assets/images/basemap/streets.jpg'),
      text: '街道图',
      display: true,
      baseMapLayers: [
        {
          id: 'streets-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Street Map',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    satellite: {
      id: 'satellite',
      thumbnailUrl: require('@/assets/images/basemap/satellite.jpg'),
      text: '影像图',
      display: true,
      baseMapLayers: [
        {
          id: 'satellite-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Imagery',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    hybrid: {
      id: 'hybrid',
      text: '带标注的影像图',
      display: true,
      thumbnailUrl: require('@/assets/images/basemap/hybrid.jpg'),
      baseMapLayers: [
        {
          id: 'hybrid-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Imagery',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'hybrid-reference-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Boundaries and Places',
          isReference: !0,
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    terrain: {
      id: 'terrain',
      thumbnailUrl: require('@/assets/images/basemap/terrain.jpg'),
      text: '带标注的 Terrain 图',
      display: true,
      baseMapLayers: [
        {
          id: 'terrain-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Terrain Base',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'terrain-reference-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Reference Overlay',
          isReference: !0,
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    topo: {
      id: 'topo',
      thumbnailUrl: require('@/assets/images/basemap/topo.jpg'),
      display: true,
      text: '地形图',
      baseMapLayers: [
        {
          id: 'topo-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Topo Map',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    gray: {
      id: 'gray',
      thumbnailUrl: require('@/assets/images/basemap/gray.jpg'),
      text: '浅灰色画布地图',
      baseMapLayers: [
        {
          id: 'gray-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Light Gray Base',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'gray-reference-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Light Gray Reference',
          isReference: !0,
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'dark-gray': {
      id: 'dark-gray',
      text: '深灰色画布地图',
      display: true,

      thumbnailUrl: require('@/assets/images/basemap/dark-gray.jpg'),
      baseMapLayers: [
        {
          id: 'dark-gray-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Dark Gray Base',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'dark-gray-reference-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Dark Gray Reference',
          isReference: !0,
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    oceans: {
      id: 'oceans',
      thumbnailUrl: require('@/assets/images/basemap/oceans.jpg'),
      text: '海洋图',
      display: true,
      baseMapLayers: [
        {
          id: 'oceans-base-layer',
          url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Ocean Base',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'oceans-reference-layer',
          url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Ocean Reference',
          isReference: !0,
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'national-geographic': {
      id: 'national-geographic',
      thumbnailUrl: require('@/assets/images/basemap/national-geographic.jpg'),
      text: '国家地图',
      display: true,
      baseMapLayers: [
        {
          id: 'national-geographic-base-layer',
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer',
          title: 'NatGeo World Map',
          showLegend: !1,
          layerType: 'ArcGISTiledMapServiceLayer',
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    osm: {
      id: 'osm',
      thumbnailUrl: require('@/assets/images/basemap/osm.jpg'),
      text: '开放维基世界地图',
      display: false,
      baseMapLayers: [
        {
          id: 'osm-base-layer',
          layerType: 'OpenStreetMap',
          title: 'Open Street Map',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'dark-gray-vector': {
      id: 'dark-gray-vector',
      thumbnailUrl: require('@/assets/images/basemap/dark-gray-vector.jpg'),
      display: false,
      baseMapLayers: [
        {
          id: 'dark-gray-base-layer',
          styleUrl:
            'https://cdn.arcgis.com/sharing/rest/content/items/5e9b3685f4c24d8781073dd928ebda50/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'Dark Gray Base',
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'dark-gray-reference-layer',
          styleUrl:
            'https://cdn.arcgis.com/sharing/rest/content/items/747cb7a5329c478cbe6981076cc879c5/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'Dark Gray Reference',
          isReference: !0,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'gray-vector': {
      id: 'gray-vector',
      thumbnailUrl: require('@/assets/images/basemap/gray-vector.jpg'),
      dispaly: false,
      baseMapLayers: [
        {
          id: 'gray-base-layer',
          styleUrl:
            'https://cdn.arcgis.com/sharing/rest/content/items/291da5eab3a0412593b66d384379f89f/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'Light Gray Base',
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'gray-reference-layer',
          styleUrl:
            'https://cdn.arcgis.com/sharing/rest/content/items/1768e8369a214dfab4e2167d5c5f2454/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'Light Gray Reference',
          isReference: !0,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'streets-vector': {
      id: 'streets-vector',
      thumbnailUrl: require('@/assets/images/basemap/streets-vector.jpg'),
      display: false,
      baseMapLayers: [
        {
          id: 'streets-vector-base-layer',
          styleUrl:
            '//www.arcgis.com/sharing/rest/content/items/de26a3cf4cc9451298ea173c4b324736/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'World Streets',
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'topo-vector': {
      id: 'topo-vector',
      thumbnailUrl: require('@/assets/images/basemap/topo-vector.jpg'),
      display: false,
      baseMapLayers: [
        {
          id: 'world-hillshade-layer',
          url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Hillshade',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'topo-vector-base-layer',
          styleUrl:
            '//www.arcgis.com/sharing/rest/content/items/7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'World Topo',
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'streets-night-vector': {
      id: 'streets-night-vector',
      thumbnailUrl: require('@/assets/images/basemap/streets-night.jpg'),
      display: false,
      baseMapLayers: [
        {
          id: 'streets-night-vector-base-layer',
          styleUrl:
            '//www.arcgis.com/sharing/rest/content/items/86f556a2d1fd468181855a35e344567f/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'World Streets Night',
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'streets-relief-vector': {
      id: 'streets-relief-vector',
      thumbnailUrl: require('@/assets/images/basemap/streets-relief.jpg'),
      display: false,

      baseMapLayers: [
        {
          id: 'world-hillshade-layer',
          url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
          layerType: 'ArcGISTiledMapServiceLayer',
          title: 'World Hillshade',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
        {
          id: 'streets-relief-vector-base-layer',
          styleUrl:
            '//www.arcgis.com/sharing/rest/content/items/b266e6d17fc345b498345613930fbd76/resources/styles/root.json',
          title: 'World Streets Relief',
          layerType: 'VectorTileLayer',
          showLegend: !1,
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    'streets-navigation-vector': {
      id: 'streets-navigation-vector',
      thumbnailUrl: require('@/assets/images/basemap/streets-navigation.jpg'),
      baseMapLayers: [
        {
          id: 'streets-navigation-vector-base-layer',
          styleUrl:
            '//www.arcgis.com/sharing/rest/content/items/63c47b7177f946b49902c24129b87252/resources/styles/root.json',
          layerType: 'VectorTileLayer',
          title: 'World Streets Navigation',
          visibility: !0,
          opacity: 1,
        },
      ],
    },
    tdtVector: {
      id: 'tdtVector',
      thumbnailUrl: require('@/assets/images/basemap/vec_c.png'),
      text: '天地图矢量图',
      display: true,
      baseMapLayers: [
        {
          id: 'WMTS_6788',
          templateUrl:
            'http://basemaps.geosonline.cn/t/vec_w/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=vec&STYLE=default&FORMAT=tiles&TILEMATRIXSET=w&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}',
          url:
            'http://t{s}.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
            tiandituTk,

          layerType: 'WebTiledLayer',
          title: '天地图矢量地图',
          visibility: !0,
          opacity: 1,
          fullExtent: {
            spatialReference: { wkid: 102100 },
            wkid: 102100,
            xmax: 20037508.34278,
            xmin: -20037508.342787,
            ymax: 20037508.342787,
            ymin: -20037508.34278,
          },
        },
        {
          id: 'WMTS_6319',
          templateUrl:
            'http://basemaps.geosonline.cn/t/cva_w/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=cva&STYLE=default&FORMAT=tiles&TILEMATRIXSET=w&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}',
          url:
            'http://t{s}.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=' +
            tiandituTk,
          layerType: 'WebTiledLayer',
          title: '天地图矢量地图注记',
          visibility: !0,
          opacity: 1,
          fullExtent: {
            spatialReference: { wkid: 102100 },
            wkid: 102100,
            xmax: 20037508.34278,
            xmin: -20037508.342787,
            ymax: 20037508.342787,
            ymin: -20037508.34278,
          },
        },
      ],
    },
    tdtImage: {
      id: 'tdtImage',
      thumbnailUrl: require('@/assets/images/basemap/img_c.png'),
      text: '天地图影像',
      display: true,
      baseMapLayers: [
        {
          id: 'WMTS_6788',
          url:
            'http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
            tiandituTk,

          layerType: 'WebTiledLayer',
          title: '天地图影像',
          visibility: !0,
          opacity: 1,
          fullExtent: {
            spatialReference: { wkid: 102100 },
            wkid: 102100,
            xmax: 20037508.34278,
            xmin: -20037508.342787,
            ymax: 20037508.342787,
            ymin: -20037508.34278,
          },
        },
        {
          id: 'WMTS_6319',
          url:
            'http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=' +
            tiandituTk,
          layerType: 'WebTiledLayer',
          title: '天地图影像注记',
          visibility: !0,
          opacity: 1,
          fullExtent: {
            spatialReference: { wkid: 102100 },
            wkid: 102100,
            xmax: 20037508.34278,
            xmin: -20037508.342787,
            ymax: 20037508.342787,
            ymin: -20037508.34278,
          },
        },
      ],
    },
  },
};
