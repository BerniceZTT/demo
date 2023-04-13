export default {
  layerData: [
    {
      title: '三维模型',
      key: '3dModel',
      children: [
        {
          title: '工厂-倾斜摄影',
          key: 'factory',
          //url: 'http://data.marsgis.cn/3dtiles/qx-changfang/tileset.json',
          url: "https://www.thingjs.com/static/tilesData/tileset.json",
          type: "3dtile",
          center: {
            lng: 115.459959,
            lat: 40.415179,
            alt: 80,
            height: 10,
            heading: 0,
            pitch: -60,
            roll: 0,
          },
        },
        {
          title: 'BIM模型',
          key: 'shihuaFactory',
          url: 'http://data.mars3d.cn/3dtiles/max-shihua/tileset.json',
          type: "3dtile",
          center: {
            lat: 31.659116,
            lng: 117.077158,
            height: 0,
            alt: 24.6,
            heading: 316.4,
            pitch: -50.1,
            roll: 359.8,
          },
        },
        {
          title: '城市白膜',
          key: 'cityModel',
          url: 'http://150.158.184.224:8011/modelData/3dtile/kunming-bm/tileset.json',
          center: {
            lat: 31.795311, lng: 117.206139, alt: 4, heading: 29, pitch: -26,
            roll: 359.8,
          },
          type: "3dtile"
        },

        {
          title: 'gltf',
          key: 'gltf',
          url: "/sampleData/model/CesiumAir/Cesium_Air.glb",
          type: "gltf"
        },
        {
          title: '点云数据',
          key: 'pointCloud',
          url: "http://150.158.184.224:8011/modelData/3dtile/2018-08%E6%B0%B8%E5%AE%81%E6%A1%A5%E7%82%B9%E4%BA%91%E6%95%B0%E6%8D%AE/tileset.json",
          type: "3dtile"
        }
      ],
    },
    {
      title: '矢量数据',
      key: 'vector',
      children: [
        {
          title: 'geojsons数据',
          key: 'geojson',
          url: "/sampleData/geojson/昆明市_绿色区域.geojson",
          type: "geojson"
        },
        {
          title: 'arcgis服务',
          key: 'mapserver',
          url: "http://server.mars3d.cn/arcgis/rest/services/mars/guihua/MapServer",
          type: "mapserver"
        },
        {
          title: 'WFS服务',
          key: 'wfs',
          url: "http://server.mars3d.cn/geoserver/mars/wms",
          type: "wfs"
        },
        {
          title: 'KML数据',
          key: 'kml',
          url: "http://data.mars3d.cn/file/kml/countryboundary.kml",
          type: "kml"
        },


      ],
    },
  ],
};


// export default {
//   layerData: [
//     {
//       title: '天空',
//       key: 'sky',
//       children: [
//         {
//           title: '飞机',
//           key: 'air',
//           url: "/SampleData/model/CesiumAir/Cesium_Air.glb",
//           type: "gltf"
//         },
//         {
//           title: '汽艇',
//           key: 'drone',
//           url: "/SampleData/model/CesiumDrone/CesiumDrone.glb",
//           type: "gltf"
//         },
//       ],
//     },
//     {
//       title: '陆地',
//       key: 'vector',
//       children: [
//         {
//           title: '车',
//           key: 'car',
//           url: "/SampleData/model/CesiumMilkTruck/CesiumMilkTruck.glb",
//           type: "gltf"
//         },
//       ],
//     },
//   ],
// };
