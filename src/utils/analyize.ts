import Cesium from 'cesium';

// 淹没效果
export const drawPolygon = (viewer: { camera: { positionCartographic: { height: number; }; }; entities: { add: (arg0: { name: string; polygon: { hierarchy: any[]; perPositionHeight: boolean; extrudedHeight: number; material: any; }; }) => void; }; scene: { canvas: HTMLCanvasElement | undefined; camera: { pickEllipsoid: (arg0: any, arg1: any) => any; }; globe: { ellipsoid: any; }; }; }) => {
  var waterHeight = 100; //初始设定的水位高度
  var targetHeight =
    Number((viewer.camera.positionCartographic.height / 1000).toFixed(2)) * 100;
  console.log(targetHeight);
  var PolygonPrimitive = (function () {
    function _(positions: any) {
      this.options = {
        name: '多边形',
        polygon: {
          hierarchy: [],
          perPositionHeight: true,
          extrudedHeight: 0,
          material: Cesium.Color.fromBytes(64, 157, 253, 150),
        },
      };
      this.hierarchy = positions;
      this._init();
    }

    _.prototype._init = function () {
      var _self = this;
      var _updateHierarchy = function () {
        return _self.hierarchy;
      };
      //实时更新polygon.hierarchy
      this.options.polygon.hierarchy = new Cesium.CallbackProperty(
        _updateHierarchy,
        false,
      );
      this.timer = setInterval(() => {
        if (waterHeight < targetHeight) {
          waterHeight += 100;
          if (waterHeight > targetHeight) {
            waterHeight = targetHeight;
          }
          viewer.entities.add({
            name: '多边形',
            polygon: {
              hierarchy: positions,
              perPositionHeight: true,
              extrudedHeight: waterHeight,
              material: new Cesium.Color.fromBytes(64, 157, 253, 150),
            },
          });
        }
      }, 1000);
      //viewer.entities.add(this.options);
    };
    return _;
  })();

  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  var positions = [];
  var poly = undefined;

  //鼠标单击画点
  handler.setInputAction(function (movement) {
    var cartesian = viewer.scene.camera.pickEllipsoid(
      movement.position,
      viewer.scene.globe.ellipsoid,
    );
    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  //鼠标移动
  handler.setInputAction(function (movement) {
    var cartesian = viewer.scene.camera.pickEllipsoid(
      movement.endPosition,
      viewer.scene.globe.ellipsoid,
    );
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolygonPrimitive(positions);
      } else {
        if (cartesian != undefined) {
          positions.pop();
          cartesian.y += 1 + Math.random();
          positions.push(cartesian);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //鼠标右键单击结束绘制
  handler.setInputAction(function (movement) {
    handler.destroy();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
};
