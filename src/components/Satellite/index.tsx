// import * as Cesium from 'cesium';

// let start: any;
// let stop: any;
//   // 卫星
//   function satellite() {
//     let start = Cesium.JulianDate.fromDate(new Date());  // 获取当前时间 这不是国内的时间
//     start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate());  // 添加八小时，得到我们东八区的北京时间
//     let stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());  // 设置一个结束时间，意思是360秒之后时间结束

//     const viewer = window.viewer as Cesium.Viewer;
//     viewer.clock.startTime = start.clone();   // 给cesium时间轴设置开始的时间，也就是上边的东八区时间
//     viewer.clock.stopTime = stop.clone();     // 设置cesium时间轴设置结束的时间
//     viewer.clock.currentTime = start.clone(); // 设置cesium时间轴设置当前的时间
//     viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;  // 时间结束了，再继续重复来一遍
//     //时间变化来控制速度 // 时间速率，数字越大时间过的越快
//     viewer.clock.multiplier = 2;
//     //给时间线设置边界
//     viewer.timeline.zoomTo(start, stop);

//     const arrStates: any[] = [];
//     getRandState(arrStates, 1);
//     startFunc();
//   }

//   function mySatePosition() {
//     //卫星高度
//     //轨道高度
//     return {lon:0, lat:0, hei: 700000, phei: 700000 / 2, time: 0}
//   }

//   function computeCirclularFlight(source: string | any[], panduan: number) {
//     var property = new Cesium.SampledPositionProperty();
//     //卫星位置
//     if (panduan == 1) {
//       for (var i = 0; i < source.length; i++) {
//         var time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate);
//         var position = Cesium.Cartesian3.fromDegrees(source[i].lon, source[i].lat, source[i].hei);
//         // 添加位置，和时间对应
//         property.addSample(time, position);
//       }
//     } else if (panduan == 2) {//轨道位置
//       for (var i = 0; i < source.length; i++) {
//         var time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate);
//         var position = Cesium.Cartesian3.fromDegrees(source[i].lon, source[i].lat, source[i].phei);
//         // 添加位置，和时间对应
//         property.addSample(time, position);
//       }
//     }
//     return property;
//   }

//   function getRandState(brr: any[], count: number) {
//     for (var m = 0; m < count; m++) {
//       var arr = [];
//       var t1 = Math.floor(Math.random() * 360);
//       var t2 = Math.floor(Math.random() * 360);
//       for (var i = t1; i <= 360 + t1; i += 30) {
//         var aaa = mySatePosition();
//         aaa.lon = t2;
//         aaa.lat = i;
//         aaa.time = i - t1;
//         arr.push(aaa);
//       }
//       brr.push(arr);
//     }
//   }

//   function getStatePath(aaa: any) {
//     const viewer = window.viewer as Cesium.Viewer;
//     var entity_ty1p = computeCirclularFlight(aaa, 2);
//     var entity_ty1 = viewer.entities.add({
//       availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
//         start: start,
//         stop: stop
//       })]),
//       position: entity_ty1p,   //轨道高度
//       orientation: new Cesium.VelocityOrientationProperty(entity_ty1p),
//       cylinder: {
//         HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         length: 700000,
//         topRadius: 0,
//         bottomRadius: 900000 / 2,
//         // material: Cesium.Color.RED.withAlpha(.4),
//         // outline: !0,
//         numberOfVerticalLines: 0,
//         // outlineColor: Cesium.Color.RED.withAlpha(.8),
//         material: Cesium.Color.fromBytes(35, 170, 242, 80)
//       },
//     });

//     entity_ty1.position.setInterpolationOptions({
//       interpolationDegree: 5,
//       interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//     });

//     var entity1p = computeCirclularFlight(aaa, 1);
//     //创建实体
//     var entity1 = viewer.entities.add({
//       // 将实体availability设置为与模拟时间相同的时间间隔。
//       availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
//         start: start,
//         stop: stop
//       })]),
//       position: entity1p,//计算实体位置属性
//       //基于位置移动自动计算方向.
//       orientation: new Cesium.VelocityOrientationProperty(entity1p),
//       //加载飞机模型
//       model: {
//         uri: './models/weixing/scene.gltf',
//         scale: 1000
//       },
//       //路径
//       path: {
//         resolution: 1,
//         material: new Cesium.PolylineGlowMaterialProperty({
//           glowPower: 0.1,
//           color: Cesium.Color.PINK
//         }),
//         width: 5
//       }
//     });

//     //差值器
//     entity1.position.setInterpolationOptions({
//       interpolationDegree: 5,
//       interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//     });
//   }

//   function startFunc() {
//     for (var i = 0; i < arrStates.length; i++) {
//       getStatePath(arrStates[i]);
//     }
//   }


