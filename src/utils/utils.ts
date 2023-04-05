import _ from 'lodash';
import * as Cesium from 'cesium';
import html2canvas from 'html2canvas';

/**
 * 获取比例尺
 * @param viewer
 * @param callback
 * @returns
 */
export const getCesiumScale = (
  viewer: any,
  callback?: (value: { width: number | string; distanceLabel: string }) => void,
) => {
  var geodesic = new Cesium.EllipsoidGeodesic();
  var distances = [
    1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000,
    10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000,
    2000000, 3000000, 5000000, 10000000, 20000000, 30000000, 50000000,
  ];
  // Find the distance between two pixels at the bottom center of the screen.
  let scene = viewer.scene;
  let width = scene.canvas.clientWidth;
  let height = scene.canvas.clientHeight;
  let left = scene.camera.getPickRay(
    new Cesium.Cartesian2((width / 2) | 0, height - 1),
  );
  let right = scene.camera.getPickRay(
    new Cesium.Cartesian2((1 + width / 2) | 0, height - 1),
  );
  let globe = scene.globe;
  let leftPosition = globe.pick(left, scene);
  let rightPosition = globe.pick(right, scene);
  if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition)) {
    callback && callback({ width: '', distanceLabel: '' });
    return;
  }
  let leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
  let rightCartographic =
    globe.ellipsoid.cartesianToCartographic(rightPosition);
  geodesic.setEndPoints(leftCartographic, rightCartographic);
  let pixelDistance = geodesic.surfaceDistance;
  // Find the first distance that makes the scale bar less than 100 pixels.
  let maxBarWidth = 100;
  let distance = null;
  for (let i = distances.length - 1; !Cesium.defined(distance) && i >= 0; --i) {
    if (distances[i] / pixelDistance < maxBarWidth) {
      distance = distances[i];
    }
  }
  if (Cesium.defined(distance) && distance) {
    var label =
      distance >= 1000
        ? (distance / 1000).toString() + ' km'
        : distance.toString() + ' m';

    callback &&
      callback({ width: (distance / pixelDistance) | 0, distanceLabel: label });
  } else {
    callback && callback({ width: '', distanceLabel: '' });
  }
};

/**
 * 获取经纬度
 * @param viewer
 */
export const getPosition = (
  viewer: any,
  handler: any,
  eventType: string[],
  callback?: Function,
) => {
  const { scene } = viewer;
  const ellipsoid = scene.globe.ellipsoid;
  const camera = scene.camera;

  let longitudeString: number = 0;
  let latitudeString: number = 0;
  let height: number = 0;
  let cartesian: any = null;

  if (eventType.includes('MOUSE_MOVE')) {
    handler.setInputAction((event) => {
      cartesian = viewer.camera.pickEllipsoid(event.endPosition, ellipsoid);

      if (cartesian) {
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        longitudeString = Number(
          Cesium.Math.toDegrees(cartographic.longitude).toFixed(6),
        );
        latitudeString = Number(
          Cesium.Math.toDegrees(cartographic.latitude).toFixed(6),
        );
        height = Math.ceil(viewer.camera.positionCartographic.height);
        callback &&
          callback({
            longitudeString,
            latitudeString,
            height,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
          });
      } else {
        callback &&
          callback({
            longitudeString: 0,
            latitudeString: 0,
            height: 0,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
          });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  if (eventType.includes('WHEEL')) {
    handler.setInputAction(function () {
      height = Math.ceil(viewer.camera.positionCartographic.height);
      callback &&
        callback({
          longitudeString,
          latitudeString,
          height,
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        });
    }, Cesium.ScreenSpaceEventType.WHEEL);
  }
  if (eventType.includes('LEFT_CLICK')) {
    handler.setInputAction(function (event) {
      cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);

      if (cartesian) {
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        longitudeString = Number(
          Cesium.Math.toDegrees(cartographic.longitude).toFixed(6),
        );
        latitudeString = Number(
          Cesium.Math.toDegrees(cartographic.latitude).toFixed(6),
        );
        height = Math.ceil(viewer.camera.positionCartographic.height);
        callback && callback({ longitudeString, latitudeString, height });
      } else {
        callback &&
          callback({
            longitudeString: 0,
            latitudeString: 0,
            height: 0,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
          });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
};

/**
 * 根据实体名称 移除实体
 * @param viewer
 * @param names
 */
export const removeEntityByNames = (viewer: any, names: string[]) => {
  // 清除之前的实体
  const entitys = viewer.entities._entities._array;
  let length = entitys.length;
  // 倒叙遍历防止实体减少之后entitys[f]不存在
  for (let f = length - 1; f >= 0; f--) {
    if (entitys[f]._name && entitys[f]._name === names[0]) {
      viewer.entities.remove(entitys[f]);
    }
  }
};

// 视频截图
export const screenshots = async (el: HTMLElement) => {
  try {
    const canvas = await html2canvas(el);
    const img = document.createElement('img');
    const base64 = canvas.toDataURL();
    const file = dataURLtoFile(
      base64,
      new Date().getTime().toString() + '.png',
    );
    img.src = canvas.toDataURL();
    const a = document.createElement('a');
    a.href = img.src;
    a.setAttribute('download', 'chart-download');
    a.click();
    return file;
  } catch (error) {
    return null;
  }
};

/**
 * base64 转成 file 对象
 * @param dataUrl
 * @param filename
 * @returns
 */
function dataURLtoFile(dataURL: string, fileName: string, fileType?: string) {
  const arr = dataURL.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: fileType || 'image/png' });
}

export const flyTo = (lng: number, lat: number, alt: number, callback?: () => void) => {
  window?.viewer?.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      Number(lng),
      Number(lat),
      Number(alt),
    ),
    orientation: {
      heading: Cesium.Math.toRadians(348.4202942851978),
      pitch: Cesium.Math.toRadians(-89.74026687972041),
      roll: Cesium.Math.toRadians(0.00018078791028219854),
    },
    complete: () => {
      // 定位完成之后的回调函数
      callback?.();
    },
  });
};


function dataURLtoBlob(dataurl: any) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const exportScene = (viewer: Cesium.Viewer) => {
  viewer.render(); //重新渲染界面

  var canvas = viewer.scene.canvas;
  var image = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');

  var blob = dataURLtoBlob(image);
  var objurl = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.download = 'scene.png';
  link.href = objurl;
  link.click();
}

export const loadGeojson = async (url: string, name: string, option?: Cesium.GeoJsonDataSource.LoadOptions) => {
  return Cesium.GeoJsonDataSource.load(url, option).then((res) => {
    res.name = name;
    return res;
  })
}

export const WMSLayer = (options: Cesium.WebMapServiceImageryProvider.ConstructorOptions) => {
  const imglayerp = new Cesium.WebMapServiceImageryProvider({
    //关于cesium加载geoserver发布的不同数据，我吧参考的博客放在文章末尾，比较清楚。
    url: options.url, //你发布的图层
    layers: options.layers, //图层名
    parameters: {
      transparent: true, //是否透明
      format: 'image/png',
      srs: 'EPSG:3857',
      styles: '',
      ...options.parameters,
    },
  });
  return imglayerp;
}


export const KMLLayer = (url: string, name: string, options?: Cesium.KmlDataSource.ConstructorOptions) => {
  return Cesium.KmlDataSource.load(url, options).then((res) => {
    res.name = name;
    return res;
  })
}


export const splitScreenHandler = (viewer: Cesium.Viewer, callback: (layer: any) => void) => {
  const layers = viewer.imageryLayers;
  const earthAtNight = layers.addImageryProvider(
    new Cesium.ArcGisMapServerImageryProvider({
      url:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
    }),
  );
  earthAtNight.splitDirection = Cesium.SplitDirection.LEFT; // Only show to the left of the slider.

  // Sync the position of the slider with the split position


  callback?.(earthAtNight);



  const slider = document.getElementById("slider");
  let handler = null;
  let moveActive = false;

  if (slider) {
    viewer.scene.splitPosition =
      slider!!.offsetLeft / slider.parentElement.offsetWidth;

    handler = new Cesium.ScreenSpaceEventHandler(slider);

    function move(movement) {
      if (!moveActive) {
        return;
      }

      const relativeOffset = movement.endPosition.x;
      const splitPosition =
        (slider.offsetLeft + relativeOffset) /
        slider.parentElement.offsetWidth;
      slider.style.left = `${100.0 * splitPosition}%`;
      viewer.scene.splitPosition = splitPosition;
    }


    handler?.setInputAction(function () {
      moveActive = true;
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler?.setInputAction(function () {
      moveActive = true;
    }, Cesium.ScreenSpaceEventType.PINCH_START);

    handler?.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler?.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

    handler?.setInputAction(function () {
      moveActive = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    handler?.setInputAction(function () {
      moveActive = false;
    }, Cesium.ScreenSpaceEventType.PINCH_END);



  }



}
