import * as Cesium from 'cesium';

//面积测量类
export default class MeasureDistance {
  viewer: any;
  positions: [];
  tempPositions: [];
  vertexEntities: [];
  labelEntity: any;
  measureArea: number;
  handler: any;
  MeasureStartEvent: any;
  MeasureEndEvent: any;
  isMeasure: boolean;
  polygonEntity: any;
  mesureResultEntity: any;
  height: any;
  degreesPerRadian: number;
  radiansPerDegree: number;

  constructor(viewer: any) {
    this.viewer = viewer;
    this.initEvents();
    this.positions = [];
    this.tempPositions = [];
    this.vertexEntities = [];
    this.labelEntity = undefined;
    this.measureArea = 0; //测量结果
    this.isMeasure = false;
    this.degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
    this.radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  }

  //初始化事件
  initEvents() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.MeasureStartEvent = new Cesium.Event(); //开始事件
    this.MeasureEndEvent = new Cesium.Event(); //结束事件
  }

  //激活
  activate() {
    this.deactivate();
    this.registerEvents(); //注册鼠标事件
    //设置鼠标状态
    this.viewer.enableCursorStyle = false;
    this.viewer._element.style.cursor = 'crosshair';
    this.isMeasure = true;
    this.measureArea = 0;
  }

  //禁用
  deactivate() {
    if (!this.isMeasure) return;
    this.unRegisterEvents();
    this.viewer._element.style.cursor = 'pointer';
    this.viewer.enableCursorStyle = true;
    this.isMeasure = false;
    this.tempPositions = [];
    this.positions = [];
    this.height = undefined;
  }

  //清空绘制
  clear() {
    const entities = this.viewer.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const element = entities[i];
      if (
        element.name === 'measureArea' ||
        element.name === 'vertexEntity_point' ||
        element.name === 'measureAreaResult'
      ) {
        this.viewer.entities.remove(element);
        i--;
      }
    }
    //清除线面对象
    // this.viewer.entities.remove(this.polygonEntity);
    this.polygonEntity = undefined;

    //清除节点
    // this.vertexEntities.forEach((item) => {
    //   this.viewer.entities.remove(item);
    // });
    this.vertexEntities = [];

    //this.viewer.entities.remove(this.mesureResultEntity);
    this.mesureResultEntity = undefined;

    this.height = undefined;
  }

  //创建面对象
  createPolygonEntity() {
    this.polygonEntity = this.viewer.entities.add({
      name: 'measureArea',
      polygon: {
        hierarchy: new Cesium.CallbackProperty((e) => {
          return new Cesium.PolygonHierarchy(this.tempPositions);
          //使用最新1.72的时候 必须返回PolygonHierarchy类型 Cannot read property 'length' of undefined
          //低版本好像都可以
        }, false),
        material: Cesium.Color.GREEN.withAlpha(0.4),
        //perPositionHeight: true,
      },
      polyline: {
        positions: new Cesium.CallbackProperty((e) => {
          return this.tempPositions.concat(this.tempPositions[0]);
        }, false),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
      },
    });
  }

  //创建节点
  createVertex() {
    let vertexEntity = this.viewer.entities.add({
      name: 'vertexEntity_point',
      position: this.positions[this.positions.length - 1],
      type: 'MeasureAreaVertex',
      point: {
        color: Cesium.Color.FUCHSIA,
        pixelSize: 8,
        disableDepthTestDistance: 500,
      },
    });
    this.vertexEntities.push(vertexEntity);
  }

  //测量结果标签
  createResultLabel() {
    this.mesureResultEntity = this.viewer.entities.add({
      // position: new Cesium.CallbackProperty((e) => {
      //   return this.getCenterPosition();
      // }, false),
      position: this.positions[this.positions.length - 1],
      type: 'MeasureAreaResult',
      name: 'measureAreaResult',
      label: {
        text: new Cesium.CallbackProperty((e) => {
          return '面积' + this.computeArea(this.positions) + '平方米';
        }, false),
        scale: 0.5,
        font: 'normal 28px MicroSoft YaHei',
        // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
        // scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.4),
        // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        // pixelOffset: new Cesium.Cartesian2(0, -30),
        outlineWidth: 9,
        outlineColor: Cesium.Color.YELLOW,

        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }

  //获取节点的中心点
  getCenterPosition() {
    var polyPositions = this.polygonEntity.polygon.hierarchy.getValue(
      Cesium.JulianDate.now(),
    ).positions;

    var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;

    polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);

    return polyCenter;
  }

  //注册鼠标事件
  registerEvents() {
    this.leftClickEvent();
    this.rightClickEvent();
    this.mouseMoveEvent();
  }

  //左键点击事件
  leftClickEvent() {
    //单击鼠标左键画点点击事件
    this.handler.setInputAction((e) => {
      this.viewer._element.style.cursor = 'crosshair';
      let position = this.viewer.scene.pickPosition(e.position);
      if (!position) {
        const ellipsoid = this.viewer.scene.globe.ellipsoid;
        position = this.viewer.scene.camera.pickEllipsoid(
          e.position,
          ellipsoid,
        );
      }
      if (!position) return;
      this.positions.push(position);
      this.height = this.unifiedHeight(this.positions, this.height);
      if (this.positions.length === 1) {
        //首次点击
        this.createPolygonEntity();
      }
      this.createVertex();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //鼠标移动事件
  mouseMoveEvent() {
    this.handler.setInputAction((e) => {
      if (!this.isMeasure) return;
      this.viewer._element.style.cursor = 'crosshair';
      let position = this.viewer.scene.pickPosition(e.endPosition);
      if (!position) {
        position = this.viewer.scene.camera.pickEllipsoid(
          e.startPosition,
          this.viewer.scene.globe.ellipsoid,
        );
      }
      if (!position) return;
      this.handleMoveEvent(position);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  //处理鼠标移动
  handleMoveEvent(position: any) {
    if (this.positions.length < 1) return;

    this.height = this.unifiedHeight(this.positions, this.height);
    this.tempPositions = this.positions.concat(position);
    if (this.positions.length >= 3 && !this.mesureResultEntity) {
      this.createResultLabel();
    }
  }

  computeArea(points: any[]) {
    var res = 0;
    //拆分三角曲面

    for (var i = 0; i < points.length - 2; i++) {
      var j = (i + 1) % points.length;
      var k = (i + 2) % points.length;
      var totalAngle = this.Angle(points[i], points[j], points[k]);

      var dis_temp1 = this.distance(this.positions[i], this.positions[j]);
      var dis_temp2 = this.distance(this.positions[j], this.positions[k]);
      res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
      console.log(res);
    }

    return (res / 1000000.0).toFixed(4);
  }

  //  距离
  distance(point1: any, point2: any) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    var s = geodesic.surfaceDistance;
    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2),
    );
    return s;
  }

  // 角度
  Angle(p1, p2, p3) {
    var bearing21 = this.Bearing(p2, p1);
    var bearing23 = this.Bearing(p2, p3);
    var angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }

  //  方向
  Bearing(from: any, to: any) {
    var lat1 = from.x * this.radiansPerDegree;
    var lon1 = from.y * this.radiansPerDegree;
    var lat2 = to.x * this.radiansPerDegree;
    var lon2 = to.y * this.radiansPerDegree;
    var angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
    );
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    angle = angle * this.degreesPerRadian; //角度
    return angle;
  }

  //统一节点的高度
  unifiedHeight(positions: any[], height: number) {
    if (!height) height = this.getPositionHeight(positions[0]); //如果没有指定高度 就用第一个的高度
    let point3d;
    for (let i = 0; i < positions.length; i++) {
      const element = positions[i];
      point3d = this.cartesian3ToPoint3D(element);
      positions[i] = Cesium.Cartesian3.fromDegrees(
        point3d.x,
        point3d.y,
        height,
      );
    }

    return height;
  }

  //获取某个点的高度
  getPositionHeight(position: any) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    return cartographic.height;
  }

  cartesian3ToPoint3D(position: any) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    return { x: lon, y: lat, z: cartographic.height };
  }

  //右键事件
  rightClickEvent() {
    this.handler.setInputAction((e) => {
      if (!this.isMeasure || this.positions.length < 3) {
        this.deactivate();
        this.clear();
      } else {
        this.tempPositions = [...this.positions];
        this.polygonEntity.polyline = {
          positions: this.positions.concat(this.positions[0]),
          width: 2,
          material: Cesium.Color.YELLOW,
          depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW,
          }),
        };

        this.polygonEntity.polygon.hierarchy = new Cesium.PolygonHierarchy(
          this.tempPositions,
        );
        // this.mesureResultEntity.position = this.getCenterPosition();
        (this.mesureResultEntity.position = this.getCenterPosition()),
          (this.mesureResultEntity.label.text =
            '总面积' + this.computeArea(this.positions) + '平方米');
        this.measureEnd();
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  //测量结束
  measureEnd() {
    this.deactivate();
    this.MeasureEndEvent.raiseEvent(this.measureArea); //触发结束事件 传入结果
  }

  //解除鼠标事件
  unRegisterEvents() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}
