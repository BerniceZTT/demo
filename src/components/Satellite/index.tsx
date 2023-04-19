import CustomModal from '@/components/CustomModal';
import _ from 'lodash';
import {
  Button,
  Checkbox,
  Form,
  Space,
  Tabs,
} from 'antd';
import * as Cesium from 'cesium';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import * as DkMap from './DkMap';
import { allData, satelliteData } from './const';
import * as turf from '@turf/turf';

let start: any, stop: any, entity_ty1: Cesium.Entity | any, arrStates: any[];

// 绘制轨迹圈
const wxLayer = new Cesium.CustomDataSource('wxLayer');
// 卫星图层
const satelliteLayer = new Cesium.CustomDataSource('satelliteLayer');
// 车船图层
const boardLayer = new Cesium.CustomDataSource('boardLayer');
boardLayer.show = false;

const warnLayer = new Cesium.CustomDataSource('warnLayer');
warnLayer.show = false;

let time: any;
interface Props {}


const polygonOptions = [
  { lon: 112.034586, lat: 25.104295, alt: 200 },
  { lon: 122.193261, lat: 29.937714, alt: 200 },
  { lon: 127.030564, lat: 22.873857, alt: 200 },
  { lon: 120.593755, lat: 18.706764, alt: 200 },
  { lon: 112.034586, lat: 25.104295, alt: 200 },
];


const Index: React.FC<Props> = () => {
  const [form] = Form.useForm();
  const { chanageCollapsed,} = useModel('useCesiumMap');
  const closeHandler = () => { chanageCollapsed(true);};

  const [checkWeiXingHJ, setcheckWeiXingHJ] = useState(false);
  const [checkBoard, setCheckBoard] = useState(false);
  const [checkWarn, setCheckWarn] = useState(false);

  const graphics = useMemo(() => new DkMap.Graphic(window.viewer), [window.viewer],);

  useEffect(() => {
    // flyTo(118, 271, 2685000);
    return () => {
      (window.viewer as Cesium.Viewer).dataSources.removeAll();
      clearInterval(time);
    };
  }, []);

  // 卫星
  function satellite(viewer: Cesium.Viewer) {
    start = Cesium.JulianDate.fromDate(new Date()); // 获取当前时间 这不是国内的时间
    start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()); // 添加八小时，得到我们东八区的北京时间
    stop = Cesium.JulianDate.addSeconds(start, 60 * 6, new Cesium.JulianDate(),); // 设置一个结束时间，意思是360秒之后时间结束

    viewer.clock.startTime = start.clone(); // 给cesium时间轴设置开始的时间，也就是上边的东八区时间
    viewer.clock.stopTime = stop.clone(); // 设置cesium时间轴设置结束的时间
    viewer.clock.currentTime = start.clone(); // 设置cesium时间轴设置当前的时间
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 时间结束了，再继续重复来一遍
    //时间变化来控制速度 // 时间速率，数字越大时间过的越快
    viewer.clock.multiplier = 10;
    //viewer.clock.shouldAnimate = true;
    //给时间线设置边界
    viewer.timeline.zoomTo(start, stop);

    arrStates = [];
    getRandState(arrStates, 1);
    startFunc();
  }

  function mySatePosition() {
    return {
      lon: 0,
      lat: 0,
      hei: 700000, //卫星高度
      phei: 700000 / 2, //轨道高度
      time: 0,
    };
  }

  function computeCirclularFlight(source: any[], panduan: number) {
    var property = new Cesium.SampledPositionProperty();
    if (panduan == 1) {
      //卫星位置
      for (var i = 0; i < source.length; i++) {
        var time = Cesium.JulianDate.addSeconds(
          start,
          source[i].time,
          new Cesium.JulianDate(),
        );
        var position = Cesium.Cartesian3.fromDegrees(
          source[i].lon,
          source[i].lat,
          source[i].hei,
        );
        // 添加位置，和时间对应
        property.addSample(time, position);
      }
    } else if (panduan == 2) {
      //轨道位置
      for (var i = 0; i < source.length; i++) {
        var time = Cesium.JulianDate.addSeconds(
          start,
          source[i].time,
          new Cesium.JulianDate(),
        );
        var position = Cesium.Cartesian3.fromDegrees(
          source[i].lon,
          source[i].lat,
          source[i].phei,
        );
        // 添加位置，和时间对应
        property.addSample(time, position);
      }
    }
    return property;
  }

  function getRandState(brr: any[], count: number) {
    for (var m = 0; m < count; m++) {
      var arr = [];
      var t1 = Math.floor(Math.random() * 360);
      var t2 = Math.floor(Math.random() * 360);
      for (var i = t1; i <= 360 + t1; i += 30) {
        var aaa = mySatePosition();
        aaa.lon = t2;
        aaa.lat = i;
        aaa.time = i - t1;
        arr.push(aaa);
      }
      // brr.push(arr);
    }
    brr.push(satelliteData);
  }

  useEffect(() => {
    time = setInterval(renderCylinder, 200);
  }, []);

  const renderCylinder = () => {
    const position = entity_ty1?.position?.getValue(
      window.viewer.clock.currentTime,
    );
    if (position) {
      const carto = Cesium.Cartographic.fromCartesian(position);

      wxLayer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          Cesium.Math.toDegrees(carto.longitude),
          Cesium.Math.toDegrees(carto.latitude),
          0,
        ),
        // point: {
        //   pixelSize: 3000000,
        //   color: Cesium.Color.GREEN.withAlpha(0.4),
        //   outlineColor: Cesium.Color.fromCssColorString('#fff'),
        //   // 边框宽度(像素)
        //   outlineWidth: 2,
        // },
        ellipse: {
          semiMinorAxis: 600000.0,
          semiMajorAxis: 600000.0,
          height: 0.0,
          material: Cesium.Color.GREEN.withAlpha(0.4),
          outline: false, // height must be set for outline to display
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    }
  };

  renderCylinder();

  const computerContains = (point: {
    lon: number;
    lat: number;
    alt: number;
  }) => {
    var pt = turf.point([point.lon, point.lat]);
    var poly = turf.polygon([
      [
        [polygonOptions[0].lon, polygonOptions[0].lat],
        [polygonOptions[1].lon, polygonOptions[1].lat],
        [polygonOptions[2].lon, polygonOptions[2].lat],
        [polygonOptions[3].lon, polygonOptions[3].lat],
        [polygonOptions[0].lon, polygonOptions[0].lat],
      ],
    ]);

    return turf.booleanPointInPolygon(pt, poly);
  };

  function getStatePath(aaa) {
    var entity_ty1p = computeCirclularFlight(aaa, 2);
    entity_ty1 = satelliteLayer.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: entity_ty1p, //轨道高度
      orientation: new Cesium.VelocityOrientationProperty(entity_ty1p),
      cylinder: {
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 900000 / 2,
        // material: Cesium.Color.RED.withAlpha(.4),
        // outline: !0,
        numberOfVerticalLines: 0,
        // outlineColor: Cesium.Color.RED.withAlpha(.8),
        material: Cesium.Color.fromBytes(35, 170, 242, 80),
      },
    });

    entity_ty1.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });

    var entity1p = computeCirclularFlight(aaa, 1);
    //创建实体
    var entity1 = satelliteLayer.entities.add({
      id: 'line',
      // 将实体availability设置为与模拟时间相同的时间间隔。
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: entity1p, //计算实体位置属性
      //基于位置移动自动计算方向.
      orientation: new Cesium.VelocityOrientationProperty(entity1p),
      //加载飞机模型
      model: {
        uri: '/SampleData/models/weixin.gltf',
        scale: 1000,
      },
      //路径
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.PINK,
        }),
        width: 5,
      },
    });

    //差值器
    entity1.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });

    window.viewer.clock.onStop.addEventListener(() => {
      wxLayer.entities.removeAll();
      time = null;
    });

    window.viewer.clock.onTick.addEventListener(function () {
      const positions = entity_ty1.position?.getValue(
        window.viewer.clock.currentTime,
      );

      try {
        if (Object.keys(positions).length > 0) {
          const carto = Cesium.Cartographic.fromCartesian(positions);
          if (Object.keys(carto).length > 0) {
            const isContains = computerContains({
              lon: Cesium.Math.toDegrees(carto.longitude),
              lat: Cesium.Math.toDegrees(carto.latitude),
              alt: 0,
            });
            if (Object.keys(boardLayer).length > 0) {
              if (isContains) {
                boardLayer.show = true;
                setCheckBoard(true);
              }
            }
          }
        }


        /**  绑定地球自传
        let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(
          window.viewer.clock.currentTime,
        );
        console.log("icrfToFixed", icrfToFixed);
        if (icrfToFixed) {
          let camera = window.viewer.camera;
          let offset = Cesium.Cartesian3.clone(camera.position);
          let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
          // 偏移相机，否则会场景旋转而地球不转
          camera.lookAtTransform(transform, offset);
        }

        **/
      } catch (error) {

      }

    });

    warnLayer.entities.add({
      name: 'polygon_height_and_extruded_height',
      polygon: {
        show: true,
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          polygonOptions[0].lon,
          polygonOptions[0].lat,
          polygonOptions[1].lon,
          polygonOptions[1].lat,
          polygonOptions[2].lon,
          polygonOptions[2].lat,
          polygonOptions[3].lon,
          polygonOptions[3].lat,
          polygonOptions[0].lon,
          polygonOptions[0].lat,
        ]),
        height: 300,
        extrudedHeight: 0,
        // fill: false,
        fill: true,
        // material: Cesium.Color.CYAN.withAlpha(0.5),
        material: Cesium.Color.RED.withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 5.0,
      },
    });
  }

  function startFunc() {
    for (var i = 0; i < arrStates.length; i++) {
      getStatePath(arrStates[i]);
    }
  }

  useEffect(() => {
    if (!_.isEmpty(window.viewer)) {
      const viewer = window.viewer as Cesium.Viewer;
      window.viewer.camera.flyTo({
        // destination: Cesium.Cartesian3.fromDegrees(
        //   101.8875,
        //   28.440864,
        //   3461042,
        // ),
        destination: Cesium.Cartesian3.fromDegrees(
          118,
          271,
          20000000,
        ),
        orientation: {
          heading: Cesium.Math.toRadians(67.34),
          pitch: Cesium.Math.toRadians(-88.72),
          roll: Cesium.Math.toRadians(0),
        },
        duration: 5,
        complete: function callback() {
          // 定位完成之后的回调函数
        },
      });

      if (!(window.viewer as Cesium.Viewer).entities.getById('line')) {
        (window.viewer as Cesium.Viewer).dataSources.add(wxLayer);
        viewer.dataSources.add(satelliteLayer);
        viewer.dataSources.add(boardLayer);
        viewer.dataSources.add(warnLayer);
      }
    }
  }, [window.viewer]);

  const startHandler = () => {
    window.viewer.clock.shouldAnimate = true;
    if (time == null) {
      renderCylinder();
      time = setInterval(renderCylinder, 3000);
    }
    addModal();
  };

  const stopHandler = () => {
    window.viewer.clock.shouldAnimate = false;
    clearInterval(time);
    time = null;
    clearAllLayer();
  };

  const clearAllLayer = () => {
    if (wxLayer && wxLayer.entities.values.length > 0) {
      wxLayer.entities.removeAll();
    }
    if (boardLayer && boardLayer.entities.values.length > 0) {
      boardLayer.entities.removeAll();
    }
    if (satelliteLayer && satelliteLayer.entities.values.length > 0) {
      satelliteLayer.entities.removeAll();
    }

    if (warnLayer && warnLayer.entities.values.length > 0) {
      warnLayer.entities.removeAll();
    }

    setCheckBoard(false);
    setCheckWarn(false);
    setcheckWeiXingHJ(false);
  };

  const addModal = () => {
    clearAllLayer();

    satellite(window.viewer);

    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        121.800468,
        0.832454,
        20000000,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(67.34),
        pitch: Cesium.Math.toRadians(-88.72),
        roll: Cesium.Math.toRadians(0),
      },
      duration: 5,
      complete: function callback() {
        // 定位完成之后的回调函数
      },
    });

    allData.forEach((el) => {
      const entity4 = graphics.buildPathRoaming({
        paths: el.data,
        times: el.time,
        model: {
          uri: el.url,
          scale: el.scale,
        },
        startTime: start,
        stopTime: stop,
        label: {
          text: el.name,
          font: `${el.fontSize}px 'Microsoft Yahei'`,
          outlineWidth: 3,
          fillColor: Cesium.Color.fromCssColorString(el.labelColor),
          verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //水平位置
          eyeOffset: new Cesium.Cartesian3(0.0, 400.0, 0.0),
        },
      });
      if (entity4) {
        boardLayer.entities.add(entity4);
      }
    });
    setcheckWeiXingHJ(true);
    setCheckBoard(false);
  };

  const WeiXingGJChangeHandler = (e) => {
    const value = e.target.checked;
    wxLayer.show = value;

    setcheckWeiXingHJ(e.target.checked);
  };

  const boardChangeHandler = (e) => {
    const value = e.target.checked;
    boardLayer.show = value;

    setCheckBoard(e.target.checked);
  };

  const warnAreaChangeHandler = (e) => {
    const value = e.target.checked;
    warnLayer.show = value;
    setCheckWarn(value);
  };

  return (
    <div>
      <CustomModal title={'场景模拟'} onCancel={closeHandler}>
        <div>
          <Space>
            <Button type="primary" onClick={startHandler}>
              开始
            </Button>

            <Button type="primary" onClick={stopHandler}>
              清除
            </Button>
          </Space>
        </div>
        <Tabs>
          <Tabs.TabPane tab="图层控制" key="item-1">
            <div>
              <Space direction="vertical">
                <Checkbox
                  checked={checkWeiXingHJ}
                  onChange={WeiXingGJChangeHandler}
                >
                  卫星轨迹
                </Checkbox>

                <Checkbox checked={checkBoard} onChange={boardChangeHandler}>
                  船泊、飞机、汽车
                </Checkbox>

                <Checkbox checked={checkWarn} onChange={warnAreaChangeHandler}>
                  警戒区
                </Checkbox>
              </Space>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </CustomModal>
    </div>
  );
};

export default Index;
