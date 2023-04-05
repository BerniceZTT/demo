import { customMessage } from '@/utils/common';
import * as Cesium from 'cesium';

//距离测量类
export default class MeasureDistance {
  viewer: any;
  positions: [];
  tempPositions: [];
  vertexEntities: [];
  labelEntity: undefined;
  measureDistance: number;
  partMeasureDistance: number;
  handler: any;
  MeasureStartEvent: any;
  MeasureEndEvent: any;
  isMeasure: boolean;
  lineEntity: any;
  constructor(viewer: any) {
    this.viewer = viewer;
    this.initEvents();
    this.positions = [];
    this.tempPositions = [];
    this.vertexEntities = [];
    this.labelEntity = undefined;
    this.measureDistance = 0; //测量结果
    this.partMeasureDistance = 0; // 每一段距离
    this.isMeasure = false;
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
    this.measureDistance = 0;
    this.partMeasureDistance = 0;
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
  }

  //清空绘制
  clear() {
    //清除线对象
    // const entities = this.lineEntity?.entityCollection?.values;
    // entities?.forEach((element: any) => {
    //   if (element.name === 'measure_polyline') {
    //     this.viewer.entities.remove(element);
    //   }
    // });

    // 循环全部实体
    const entities = this.viewer.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const element = entities[i];
      if (
        element.name === 'measure_polyline' ||
        element.name === 'vertexEntity_point'
      ) {
        this.viewer.entities.remove(element);
        i--;
      }
    }

    this.lineEntity = undefined;

    // //清除节点
    // this.vertexEntities.forEach((item) => {
    //   this.viewer.entities.remove(item);
    // });
    this.vertexEntities = [];
  }

  //创建线对象
  createLineEntity() {
    this.lineEntity = this.viewer.entities.add({
      name: 'measure_polyline',
      polyline: {
        positions: new Cesium.CallbackProperty((e) => {
          return this.tempPositions;
        }, false),
        width: 2,
        material: Cesium.Color.YELLOW,
        depthFailMaterial: Cesium.Color.YELLOW,
      },
    });
  }

  //创建线节点
  createVertex() {
    try {
      this.getSpaceDistance(this.positions);
      let vertexEntity = this.viewer.entities.add({
        name: 'vertexEntity_point',
        position: this.positions[this.positions.length - 1],
        id: 'MeasureDistanceVertex' + this.positions[this.positions.length - 1],
        type: 'MeasureDistanceVertex',
        label: {
          text: this.partMeasureDistance + '米',
          scale: 0.5,
          font: 'normal 24px MicroSoft YaHei',
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          //   0,
          //   6000000,
          // ),
          // scaleByDistance: new Cesium.NearFarScalar(10000000, 1, 10000001, 0.0),
          //  scaleByDistaance: new Cesium.NearFarScalar(100, 5, 10000, 15),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          // pixelOffset: new Cesium.Cartesian2(0, -30),
          outlineWidth: 9,
          outlineColor: Cesium.Color.WHITE,
          showBackground: true,
        },
        point: {
          color: Cesium.Color.FUCHSIA,
          pixelSize: 8,
          disableDepthTestDistance: 500,
        },
      });
      this.vertexEntities.push(vertexEntity);
    } catch (error) {
      customMessage.warn('出现错误');
      console.log('error', error);
    }
  }

  //创建起点
  createStartEntity() {
    let vertexEntity = this.viewer.entities.add({
      position: this.positions[0],
      name: 'vertexEntity_point',
      type: 'MeasureDistanceVertex',
      billboard: {
        image: require('../../assets/img/start.png'),
        scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      point: {
        color: Cesium.Color.FUCHSIA,
        pixelSize: 6,
      },
    });
    this.vertexEntities.push(vertexEntity);
  }

  //创建终点节点
  createEndEntity() {
    //结束时删除最后一个节点的距离标识
    let lastLabel = this.viewer.entities.getById(
      'MeasureDistanceVertex' + this.positions[this.positions.length - 1],
    );
    this.viewer.entities.remove(lastLabel);
    this.viewer.entities.remove(this.moveVertexEntity);

    this.getSpaceDistance(this.positions);
    let vertexEntity = this.viewer.entities.add({
      position: this.positions[this.positions.length - 1],
      name: 'vertexEntity_point',
      type: 'MeasureDistanceVertex',
      label: {
        text: '总距离：' + this.measureDistance.toFixed(3) + '米',
        scale: 1,
        font: 'normal 26px MicroSoft YaHei',
        // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
        // scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.5),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -50),
        outlineWidth: 9,
        outlineColor: Cesium.Color.WHITE,
        eyeOffset: new Cesium.Cartesian3(0, 0, -10),

        showBackground: true,
      },
      billboard: {
        image: require('../../assets/img/end.png'),
        scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      point: {
        color: Cesium.Color.FUCHSIA,
        pixelSize: 6,
      },
    });
    this.vertexEntities.push(vertexEntity);
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
      if (this.positions.length == 1) {
        //首次点击
        this.createLineEntity();
        this.createStartEntity();
        return;
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
  handleMoveEvent(position) {
    if (this.positions.length < 1) return;
    this.tempPositions = this.positions.concat(position);
  }

  //右键事件
  rightClickEvent(callback?: any) {
    this.handler.setInputAction((e) => {
      if (!this.isMeasure || this.positions.length < 1) {
        this.deactivate();
        this.clear();
      } else {
        this.createEndEntity();
        this.lineEntity.polyline = {
          positions: this.positions,
          width: 2,
          material: Cesium.Color.YELLOW,
          depthFailMaterial: Cesium.Color.YELLOW,
        };
        this.measureEnd();
      }
      callback && callback(this.measureDistance);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  // 获取总长度

  getTotalDistance() {
    return this.measureDistance;
  }

  //测量结束
  measureEnd() {
    this.deactivate();
    this.MeasureEndEvent.raiseEvent(this.measureDistance); //触发结束事件 传入结果
  }

  //解除鼠标事件
  unRegisterEvents() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  //空间两点距离计算函数

  getSpaceDistance(positions) {
    console.log(22);

    //只计算最后一截，与前面累加

    //因move和鼠标左击事件，最后两个点坐标重复

    var i = positions.length - 1;

    var point1cartographic = Cesium.Cartographic.fromCartesian(
      positions[positions.length - 2],
    );

    var point2cartographic = Cesium.Cartographic.fromCartesian(
      positions[positions.length - 1],
    );

    this.getTerrainDistance(point1cartographic, point2cartographic);
  }

  getTerrainDistance(point1cartographic, point2cartographic) {
    var geodesic = new Cesium.EllipsoidGeodesic();

    geodesic.setEndPoints(point1cartographic, point2cartographic);

    var s = geodesic.surfaceDistance;
    s = Math.abs(point2cartographic.height - point1cartographic.height);

    var cartoPts = [point1cartographic];

    for (var jj = 1000; jj < s; jj += 1000) {
      //分段采样计算距离

      var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);

      cartoPts.push(cartoPt);
    }

    cartoPts.push(point2cartographic);

    //返回两点之间的距离

    var promise = Cesium.sampleTerrain(
      this.viewer.terrainProvider,
      8,
      cartoPts,
    );

    Cesium.when(promise, (updatedPositions) => {
      for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
        var geoD = new Cesium.EllipsoidGeodesic();

        geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);

        var innerS = geoD.surfaceDistance;

        innerS = Math.sqrt(
          Math.pow(innerS, 2) +
          Math.pow(
            updatedPositions[jj + 1].height - updatedPositions[jj].height,
            2,
          ),
        );
        this.partMeasureDistance = Number(innerS.toFixed(2));

        this.measureDistance += Number(innerS.toFixed(2));
      }
    });
  }
}
