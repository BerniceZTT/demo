import styles from './index.less';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import TooltipDiv from '../Tool/Tooltip/tooltipDiv';
import CesiumNavigation from 'cesium-navigation-es6';
import cesiumContextMenu from '../Menu';
import { GlobeRotate } from '../GlobeRotate';

window.CESIUM_BASE_URL = '/Cesium/';

interface Props {
  id?: string;
  style?: React.CSSProperties;
}

export default function CesiumView(props: Props) {
  const { id = 'cesiumContainer', style } = props;
  const { menuType } = useModel('useCesiumMap');
  const [viewer, setViewer] = useState(null as any);

  useEffect(() => {
    Cesium.Ion.defaultAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGUxODM3ZC0wYWI5LTQ3YWYtOWViOS1hNzlhMWUzNGM2MTkiLCJpZCI6ODE3NjQsImlhdCI6MTY0NDMwNjEyNH0.a-hxx4087RWJ3UQheRGXLxWEnPP3WnnAxGYqUBBMsTI';

    //bernice
    const Viewer: any = new Cesium.Viewer(id, {
      geocoder: false, // 位置查找工具
      homeButton: true, // 视角返回初始位置
      sceneModePicker: true, // 选择视角的模式（球体、平铺、斜视平铺）
      baseLayerPicker: false, // 图层选择器（地形影像服务）
      navigationHelpButton: false, // 导航帮助(手势，鼠标)
      animation: true, //左下角仪表盘（动画器件）
      timeline: true, // 底部时间线
      fullscreenButton: true, // 全屏
      vrButton: true, // VR
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      }),
      // imageryProvider: new Cesium.UrlTemplateImageryProvider({
      //   url:'/data/maps/{z}/{x}/{y}.jpg',
      //   minimumLevel:2,
      //   maximumLevel:14
      // }),
      selectionIndicator: true,
      infoBox: true,
      shouldAnimate: true,
    });
    Viewer.scene.globe.depthTestAgainstTerrain = true;
    Viewer._cesiumWidget._creditContainer.style.display = 'none';
    Viewer.scene.postProcessStages.fxaa.enabled = true;
    Viewer.scene.fxaa = true;

    new cesiumContextMenu(Viewer);
    window.viewer = Viewer;
    window[id] = Viewer;
    // window[`${id}`] = viewer;
    Viewer.targetFrameRate = 10
    setViewer(Viewer);

    // 加载地形
    // Viewer.terrainProvider = new Cesium.ArcGISTiledElevationTerrainProvider({
    //   url:
    //     "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    //   token:
    //     "KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg..",
    // });
    // Viewer.terrainProvider = new Cesium.VRTheWorldTerrainProvider({
    //     url: "http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/",
    //     credit: "Terrain data courtesy VT MÄK",
    //   });
    // Viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://data.mars3d.cn/terrain', // 地址记得换成自己的地形数据地址
    //   requestWaterMask: true, // 开启法向量
    //   requestVertexNormals: true, // 开启水面特效
    // });

    Viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
      // url: 'http://data.mars3d.cn/terrain', // 地址记得换成自己的地形数据地址
      url: '/data/terrain', // 地址记得换成自己的地形数据地址
      requestWaterMask: true, // 开启法向量
      requestVertexNormals: true, // 开启水面特效
    });
    // 将三维球定位到中国
    // Viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(101.8875, 28.440864, 3461042),
    //   orientation: {
    //     heading: Cesium.Math.toRadians(360),
    //     pitch: Cesium.Math.toRadians(-90),
    //     roll: Cesium.Math.toRadians(0),
    //   },
    //   duration: 5,
    //   complete: function callback() {
    //     // 定位完成之后的回调函数
    //   },
    // });

    // 罗盘
    let options: any = {};
    // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
    options.defaultResetView = Cesium.Rectangle.fromDegrees(80, 22, 130, 50);
    // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
    options.enableCompass = true;
    // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
    options.enableZoomControls = false;
    // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
    options.enableDistanceLegend = false;
    // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
    options.enableCompassOuterRing = true;

    CesiumNavigation(Viewer, options);

    Viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );
    // Viewer.camera.setView({
    //   destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 3000000),
    // });
    var scene = Viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var ellipsoid = scene.globe.ellipsoid;
    var cartesian = null;

    // TooltipDiv.initTool(Viewer.cesiumWidget.container);

    // let globeRotate = new GlobeRotate(Viewer);
    // globeRotate.start();

    //一 鼠标MOUSE_MOVE
    handler.setInputAction(function (movement) {
      cartesian = Viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
      if (cartesian) {
        TooltipDiv.showAt(
          movement.endPosition,
          '<div><span>哈哈哈哈</span></div>',
        );
      } else {
        TooltipDiv.setVisible(false);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //二 LEFT_CLICK
    handler.setInputAction(function (movement) {
      cartesian = Viewer.camera.pickEllipsoid(movement.position, ellipsoid);
      let globeRotate = new GlobeRotate(Viewer);
      globeRotate.stop();
      if (cartesian) {
        TooltipDiv.showAt(movement.position, 'LEFT_CLICK');
      } else {
        TooltipDiv.setVisible(false);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //三 LEFT_DOUBLE_CLICK
    handler.setInputAction(function (movement) {
      cartesian = Viewer.camera.pickEllipsoid(movement.position, ellipsoid);
      if (cartesian) {
        TooltipDiv.showAt(movement.position, 'LEFT_DOUBLE_CLICK');
      } else {
        TooltipDiv.setVisible(false);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //四 LEFT_DOWN
    handler.setInputAction(function (movement) {
      cartesian = Viewer.camera.pickEllipsoid(movement.position, ellipsoid);
      console.log("LEFT_DOWN")
      if (cartesian) {
        TooltipDiv.showAt(movement.position, 'LEFT_DOWN');
      } else {
        TooltipDiv.setVisible(false);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    //五 LEFT_UP
    handler.setInputAction(function (movement) {
      cartesian = Viewer.camera.pickEllipsoid(movement.position, ellipsoid);
      if (cartesian) {
        TooltipDiv.showAt(movement.position, 'LEFT_UP');
      } else {
        TooltipDiv.setVisible(false);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    // Viewer.dataSources.add(
    //   Cesium.CzmlDataSource.load("/SampleData/simple.czml")
    // );

    Viewer.camera.flyHome(0);
  }, []);

  //bernice
  return (
    <div className={styles.container} style={style}>
      <div className={styles.slider} id="slider"></div>

      <div id={id} className={styles.cesiumContainer}></div>
      {/* {viewer && <LongLatInfo viewer={viewer} />} */}
    </div>
  );
}
