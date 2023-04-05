import * as  Cesium from 'cesium';
/**
   * 根据类型绘制对象
   * @param type point、polyline、polygon
   */

export class Draw {

  viewer: Cesium.Viewer;
  tempEntities: any[];
  position: any;
  tempPoints: any[];
  handler: any;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.tempEntities = [];
    this.position = [];
    this.tempPoints = [];
    viewer.scene.globe.depthTestAgainstTerrain = true;
    this.init();
  }

  init() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

  }



  drawPoint() {
    // 监听鼠标左键
    this.handler.setInputAction((movement: any) => {
      // 从相机位置通过windowPosition 世界坐标中的像素创建一条射线。返回Cartesian3射线的位置和方向。
      let ray = this.viewer.camera.getPickRay(movement.position);
      // 查找射线与渲染的地球表面之间的交点。射线必须以世界坐标给出。返回Cartesian3对象
      this.position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      let point = this.drawPointFun(this.position);
      this.tempEntities.push(point);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 左键双击停止绘制
    this.handler.setInputAction(() => {
      this.handler.destroy();//关闭事件句柄
      this.handler = null;
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // 右击单击停止绘制
    this.handler.setInputAction(() => {
      this.handler.destroy();//关闭事件句柄
      this.handler = null;
      this.position = [];
      this.tempEntities = [];
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  private drawPointFun(position: any, config?: any) {
    let viewer = this.viewer;
    let config_ = config ? config : {};
    return viewer.entities.add({
      name: "点几何对象",
      position: position,
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      }
    });
  }

  drawPolyline() {
    //鼠标移动事件
    this.handler.setInputAction((movement) => {
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //左键点击操作
    this.handler.setInputAction((click) => {
      //调用获取位置信息的接口
      let ray = this.viewer.camera.getPickRay(click.position);
      this.position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      this.tempPoints.push(this.position);
      let tempLength = this.tempPoints.length;
      //调用绘制点的接口
      let point = this.drawPointFun(this.tempPoints[this.tempPoints.length - 1]);
      this.tempEntities.push(point);
      if (tempLength > 1) {
        let pointline = this.drawPolylineFun([this.tempPoints[this.tempPoints.length - 2], this.tempPoints[this.tempPoints.length - 1]]);
        this.tempEntities.push(pointline);
      } else {
        // tooltip.innerHTML = "请绘制下一个点，右键结束";
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击操作
    this.handler.setInputAction((click) => {
      this.tempPoints = [];
      this.handler.destroy();//关闭事件句柄
      this.handler = null;
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  private drawPolylineFun(positions: any[], config_?: any) {
    let viewer = this.viewer;
    if (positions.length < 1) return;
    let config = config_ ? config_ : {};
    return viewer.entities.add({
      name: "线几何对象",
      polyline: {
        positions: positions,
        width: config.width ? config.width : 5.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: config.color ? Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD,
        }),
        depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
          color: config.color ? Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD,
        }),
        clampToGround: true,
      }
    });
  }


  drawPolygon() {
    let handler = this.handler;
    let viewer = this.viewer;
    let position = this.position;
    let tempPoints = this.tempPoints;
    let tempEntities = this.tempEntities;
    //鼠标移动事件
    handler.setInputAction((movement) => {
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //左键点击操作
    handler.setInputAction((click) => {
      //调用获取位置信息的接口
      let ray = viewer.camera.getPickRay(click.position);
      position = viewer.scene.globe.pick(ray, viewer.scene);
      tempPoints.push(position);
      let tempLength = tempPoints.length;
      //调用绘制点的接口
      let point = this.drawPointFun(position);
      tempEntities.push(point);
      if (tempLength > 1) {
        let pointline = this.drawPolylineFun([tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1]]);
        tempEntities.push(pointline);
      } else {
        // tooltip.innerHTML = "请绘制下一个点，右键结束";
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击操作
    handler.setInputAction((click) => {
      let cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);

      if (cartesian) {
        let tempLength = tempPoints.length;
        if (tempLength < 3) {
          alert('请选择3个以上的点再执行闭合操作命令');
        } else {
          //闭合最后一条线
          let pointline = this.drawPolylineFun([tempPoints[tempPoints.length - 1], tempPoints[0]]);
          tempEntities.push(pointline);
          this.drawPolygonFun(tempPoints);
          tempEntities.push(tempPoints);
          handler.destroy();//关闭事件句柄
          handler = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  private drawPolygonFun(positions: any[], config_?: any) {
    let viewer = this.viewer;
    if (positions.length < 2) return;
    let config = config_ ? config_ : {};
    return viewer.entities.add({
      name: "面几何对象",
      polygon: {
        hierarchy: positions,
        material: config.color ? Cesium.Color.fromCssColorString(config.color).withAlpha(.2) : Cesium.Color.fromCssColorString("#FFD700").withAlpha(.2),
      },
    });
  }

  clear() {
    this.viewer.entities.removeAll();
  }


}

