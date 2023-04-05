import { tiandituTk } from '@/config';
import { IBaseMapLayers, IBaseMapType } from '@/pages/inteface';
import * as Cesium from 'cesium';

export const loadArcgisMap = (viewer: any, baseMapLayers: IBaseMapLayers[]) => {
  const imageryLayers = viewer.imageryLayers;

  if (imageryLayers.length > 1) {
    imageryLayers._layers.forEach((el: any) => {
      if (!el._isBaseLayer) {
        imageryLayers.remove(el, true);
      }
    });
    imageryLayers.removeAll(true);
  }
  const layers = baseMapLayers.map((item: IBaseMapLayers) => {
    let imageryProvider = null;
    switch (item.layerType) {
      case 'ArcGISTiledMapServiceLayer':
        imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
          url: item.url,
        });
        const layer = new Cesium.ImageryLayer(imageryProvider);
        imageryLayers.add(layer);
        break;
      case 'WebTiledLayer':
        imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
          //影像底图
          url: item.url || '',
          //subdomains: subdomains,
          layer: item.id + 'ImgLayer',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'GoogleMapsCompatible', //使用谷歌的瓦片切片方式,
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        });
        imageryLayers.addImageryProvider(imageryProvider);
        break;
      default:
        imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
          url: item.url,
        });
        break;
    }
  });
};

/**
 *
 * @param viewer
 * @param url
 */
export const add3dTile = (viewer: any, value: any) => {
  const tileset = new Cesium.Cesium3DTileset({
    url: value.url,
    maximumScreenSpaceError: 1,
    maximumMemoryUsage: 1024,

    // 以下参数可以参考用于3dtiles总数据大，清晰度过高情况下进行性能优化。这不是一个通用的解决方案，但可以以此为参考。
    skipLevelOfDetail: true,
    loadSiblings: true,
    cullRequestsWhileMoving: true,
    cullRequestsWhileMovingMultiplier: 10,
    preferLeaves: true,
    dynamicScreenSpaceError: true,
    preloadWhenHidden: true,
  });
  const { center } = value;

  tileset.readyPromise.then(
    function (tileset) {
      viewer.scene.primitives.add(tileset);
      //changeHeight(tileset, center);

      //获取3Dtlies的bounds范围
      const boundingSphere = tileset.boundingSphere;
      //获取3Dtlies的范围中心点的弧度
      const cartographic = Cesium.Cartographic.fromCartesian(
        boundingSphere.center,
      );

      const surface = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        0.0,
      );
      const offset = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        center.alt,
      );
      const translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3(),
      );
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

      // update3dtilesMaxtrix(tileset, { offect_z: center.alt })
      // viewer.zoomTo(
      //   tileset,
      //   new Cesium.HeadingPitchRange(
      //     center.heading,
      //     center.pitch,
      //     center.alt || 653,
      //   ),
      // );

      viewer.zoomTo(tileset);
    },
    (error) => {
      console.log(error);
    },
  );
};

const update3dtilesMaxtrix = (tileset: any, ele: any) => {
  if (!tileset.ready) {
    return;
  }
  // 根据tileset的边界球体中心点的笛卡尔坐标得到经纬度坐标
  const cartographic = Cesium.Cartographic.fromCartesian(
    tileset.boundingSphere.center,
  );
  // 根据经纬度和高度0，得到地面笛卡尔坐标
  const surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    cartographic.height,
  );
  // 根据经纬度和需要的高度，得到偏移后的笛卡尔坐标
  const offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude + Cesium.Math.toRadians(ele.offset_x || 0), // 这里更改的是经纬度偏移
    cartographic.latitude + Cesium.Math.toRadians(ele.offset_y || 0),
    cartographic.height + ele.offset_z || 0, // 程度的高度 需要偏移
  );
  // 计算坐标变换，得到新的笛卡尔坐标
  const translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3(),
  );
  // 调整3dtiles位置
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};

/**
 * 设置高度
 * @param height
 * @param tileset
 * @returns
 */
export const changeHeight = (tileset: any, center?: any) => {
  const height = Number(center.height);
  if (isNaN(height)) {
    return;
  }
  var cartographic = Cesium.Cartographic.fromCartesian(
    tileset.boundingSphere.center,
  );
  console.log(cartographic);
  console.log(center);

  // cartographic.longitude = 117.217024;
  // cartographic.latitude = 31.840525;

  var surface = Cesium.Cartesian3.fromRadians(
    center.lng || cartographic.longitude,
    center.lat || cartographic.latitude,
    height || cartographic.height,
  );
  var offset = Cesium.Cartesian3.fromRadians(
    center.lng || cartographic.longitude,
    center.lat || cartographic.latitude,
    height,
  );
  var translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3(),
  );
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};

export const zoomToTileset = (tileset: any, viewer: any) => {
  const boundingSphere = tileset.boundingSphere;
  viewer.camera.viewBoundingSphere(
    boundingSphere,
    new Cesium.HeadingPitchRange(503, -2.0, 0),
  );

  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
};

export function initHandler(viewer0: Cesium.Viewer, viewer1: Cesium.Viewer) {
  var _self = {} as any;
  if (
    _self?.handler &&
    _self?.handler?.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  ) {
    return;
  }
  _self.handler = new Cesium.ScreenSpaceEventHandler(viewer0.scene.canvas);
  _self.handler1 = new Cesium.ScreenSpaceEventHandler(viewer1.scene.canvas);
  _self.handler.setInputAction((movement) => {
    var _camerca = viewer0.camera;
    viewer1.camera.setView({
      destination: _camerca.position,
      orientation: {
        direction: _camerca._direction,
        up: _camerca.up,
        heading: _camerca.heading,
        pitch: _camerca.pitch,
        roll: _camerca.roll,
      },
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  _self.handler.setInputAction((movement) => {
    var _camerca = viewer0.camera;
    viewer1.camera.setView({
      destination: _camerca.position,
      orientation: {
        direction: _camerca._direction,
        up: _camerca.up,
        heading: _camerca.heading,
        pitch: _camerca.pitch,
        roll: _camerca.roll,
      },
    });
  }, Cesium.ScreenSpaceEventType.WHEEL);

  _self.handler1.setInputAction((movement) => {
    var _camerca = viewer1.camera;
    viewer0.camera.setView({
      destination: _camerca.position,
      orientation: {
        direction: _camerca._direction,
        up: _camerca.up,
        heading: _camerca.heading,
        pitch: _camerca.pitch,
        roll: _camerca.roll,
      },
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  _self.handler1.setInputAction((movement) => {
    var _camerca = viewer1.camera;
    viewer0.camera.setView({
      destination: _camerca.position,
      orientation: {
        direction: _camerca._direction,
        up: _camerca.up,
        heading: _camerca.heading,
        pitch: _camerca.pitch,
        roll: _camerca.roll,
      },
    });
  }, Cesium.ScreenSpaceEventType.WHEEL);
}

function clearHandler() {
  var _self = {} as any;
  if (_self.handler) {
    _self.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    _self.handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
  }
  if (_self.handler1) {
    _self.handler1.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    _self.handler1.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
  }
}
