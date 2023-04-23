import { ReactNode, useEffect, useRef, useState } from 'react';
import CesiumView from '../components/CesiumView';
import { useModel } from 'umi';
import * as Cesium from 'cesium';
import '../global.less';
import styles from './index.less';
import {applyPolyfills, defineCustomElements,} from '@esri/calcite-components/dist/loader';
import '@esri/calcite-components/dist/calcite/calcite.css';
import Measure from '@/components/Measure';
import BaseMap from '@/components/BaseMap';
import MapLocation from '@/components/Location';
import Layer from '@/components/Layer';
import {
  CalciteAction,
  CalciteActionBar,
  CalciteActionGroup,
  CalciteFlow,
  CalciteShell,
  CalciteShellPanel,
} from '@esri/calcite-components-react';
import BookMark from './BookMark';
import Navigation from './Navigation';
import ExportScene from './ExportScene';
import { initHandler } from '@/utils/layerUtils';
import SplitScreen from './SplitScreen';
import Draw from './Draw';
import _ from 'lodash';
import Demo from './Demo';

applyPolyfills().then(() => {
  defineCustomElements(window);
});

let start: any, stop: any, entity_ty1: Cesium.Entity | any, arrStates: any[];
const wxLayer = new Cesium.CustomDataSource('wxLayer');

let time: any;
export default function IndexPage() {
  const { collapsed, chanageCollapsed, changeMenuType } = useModel('useCesiumMap');
  const [ expanded, setExpanded] = useState(false);

  const [actionType, setActionType] = useState<string>('');
  const [headerTitle, setHeaderTitle] = useState<string>('');
  const ref = useRef({movePositions: null,});

  let Panel: ReactNode = null;
  const panel: any = {
    baseMap: <BaseMap />,
    demo: <Demo />,
    measure: <Measure />,
    location: <MapLocation />,
    layer: <Layer />,
    bookmark: <BookMark />,
    navigation: <Navigation />,
    print: <ExportScene />,
    splitScreen: <SplitScreen />,
    draw: <Draw />,
  };
  const clickHandler = (e: any) => {
    const type: string = e.target.getAttribute('data-type');
    const title: string = e.target.getAttribute('text');
    changeMenuType(type);
    if (type) {
      if (type === 'roller') {
        setActionType(type);

        chanageCollapsed(true);
      } else {
        Panel = panel[type];
        setActionType(type);
        setHeaderTitle(title);
        chanageCollapsed(false);
      }
    }
  };

  useEffect(() => {
    if (actionType === 'roller' && window.viewer01 && window.viewer02) {
      initHandler(window.viewer01, window.viewer02);
    } else {
    }
  }, [actionType, window.viewer01, window.viewer02]);

  // 卫星
  function satellite(viewer: Cesium.Viewer) {
    start = Cesium.JulianDate.fromDate(new Date()); // 获取当前时间 这不是国内的时间
    start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()); // 添加八小时，得到我们东八区的北京时间
    stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate()); // 设置一个结束时间，意思是360秒之后时间结束

    viewer.clock.startTime = start.clone(); // 给cesium时间轴设置开始的时间，也就是上边的东八区时间
    viewer.clock.stopTime = stop.clone(); // 设置cesium时间轴设置结束的时间
    viewer.clock.currentTime = start.clone(); // 设置cesium时间轴设置当前的时间
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 时间结束了，再继续重复来一遍
    //时间变化来控制速度 // 时间速率，数字越大时间过的越快
    viewer.clock.multiplier = 2;
    viewer.clock.shouldAnimate = true;
    viewer.clock.canAnimate = true;
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
      brr.push(arr);
    }
  }
  renderCylinder();
  function renderCylinder() {
    time = setInterval(() => {
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
          cylinder: {
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            // classificationType: Cesium.ClassificationType.BOTH,
            length: 700,
            topRadius: 0,
            bottomRadius: 900000 / 2,
            // material: Cesium.Color.RED.withAlpha(.4),
            // outline: !0,
            numberOfVerticalLines: 0,
            // outlineColor: Cesium.Color.RED.withAlpha(.8),
            // material: Cesium.Color.RED.withAlpha(0.5),
            material: Cesium.Color.fromBytes(35, 170, 70, 80),
          },
        });
      }
    }, 3000);
  }

  function getStatePath(aaa: any[]) {
    var entity_ty1p = computeCirclularFlight(aaa, 2);
    entity_ty1 = window.viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: entity_ty1p, //轨道高度
      orientation: new Cesium.VelocityOrientationProperty(entity_ty1p),
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 900000 / 2,
        numberOfVerticalLines: 0,
        material: Cesium.Color.fromBytes(35, 170, 242, 80),
      },
    });

    entity_ty1.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });

    var entity1p = computeCirclularFlight(aaa, 1);
    // console.log("12121", new Cesium.VelocityOrientationProperty(entity1p));
    //创建实体
    var entity1 = window.viewer.entities.add({
      id: 'line',
      // 将实体availability设置为与模拟时间相同的时间间隔。
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop,}),]),
      position: entity1p, //计算实体位置属性
      //基于位置移动自动计算方向.
      orientation: new Cesium.VelocityOrientationProperty(entity1p),
      //加载飞机模型
      model: {
        uri: '/SampleData/weixin.gltf',
        scale: 1000,
      },
      //路径
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1,　color: Cesium.Color.PINK,}),
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
      // setMovePosutions(aa);
      // movePositions = aa;
      ref.current.movePositions = positions;

      //  renderCylinder(positions);
    });
  }

  function startFunc() {
    for (var i = 0; i < arrStates.length; i++) {
      getStatePath(arrStates[i]);
    }
  }

  useEffect(() => {
    if (!_.isEmpty(window.viewer)) {
      if (!(window.viewer as Cesium.Viewer).entities.getById('line')) {
        (window.viewer as Cesium.Viewer).dataSources.add(wxLayer);
        satellite(window.viewer);
      }
    }
  }, [window.viewer]);

  return (
    <>
      <CalciteShell>
        <CalciteShellPanel
          id="shellPanel"
          slot="primary-panel"
          position="start"
          detached={false}
          collapsed={collapsed}
          className={styles.bgColor}
        >
          <CalciteActionBar
            slot="action-bar"
            expanded={expanded}
            onCalciteActionBarToggle = {(e)=>{
              setExpanded(!expanded);
            }}
            intlCollapse={"关闭"}
            onClick={(e) => {
              clickHandler(e);
            }}
          >
            <CalciteActionGroup>
              <CalciteAction text="demo" icon="layers" data-type="demo" />
            </CalciteActionGroup>
            <CalciteActionGroup>
              <CalciteAction title="底图" text="底图" icon="basemap" data-type="baseMap"/>
              <CalciteAction text="图层" icon="layers" data-type="layer" />
            </CalciteActionGroup>
            <CalciteActionGroup>
              <CalciteAction
                text="图上量算"
                icon="measure"
                data-type="measure"
              />
              <CalciteAction
                text="坐标定位"
                icon="gps-on-f"
                data-type="location"
              />
              {/* <CalciteAction text="视角书签" icon="pins" data-type="bookmark" /> */}
            </CalciteActionGroup>

            <CalciteActionGroup>
              <CalciteAction
                text="分屏对比"
                icon="layout-horizontal"
                data-type="roller"
              />
              <CalciteAction
                text="卷帘对比"
                icon="content-small"
                data-type="splitScreen"
              />
            </CalciteActionGroup>
            <CalciteActionGroup>
              <CalciteAction
                text="图上标绘"
                icon="annotate-tool"
                data-type="draw"
              />
              <CalciteAction
                text="线路导航"
                icon="tour"
                data-type="navigation"
              />
              <CalciteAction text="地图打印" icon="print" data-type="print" />
            </CalciteActionGroup>
            <CalciteActionGroup>
              <CalciteAction
                text="图上标绘"
                icon="annotate-tool"
                data-type="draw"
              />
              <CalciteAction
                text="线路导航"
                icon="tour"
                data-type="navigation"
              />
              <CalciteAction text="地图打印" icon="print" data-type="print" />
            </CalciteActionGroup>
          </CalciteActionBar>

          <CalciteFlow>{panel[actionType]}</CalciteFlow>
        </CalciteShellPanel>
        {actionType === 'roller' ? (
          <div style={{ display: 'flex' }}>
            <CesiumView id="viewer01" style={{ width: '50%' }} />
            <CesiumView id="viewer02" style={{ width: '50%' }} />
          </div>
        ) : (
          <CesiumView />
        )}
      </CalciteShell>
    </>
  );
}
