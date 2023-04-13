import {Button, Form, InputNumber} from 'antd';
import React, { useEffect, useMemo } from 'react';
import * as Cesium from 'cesium';
import { useModel } from 'umi';
import { getPosition, removeEntityByNames } from '@/utils/utils';
import { IMapLoaction } from '@/pages/inteface';
import CustomModal from '@/components/CustomModal';
import Draw from '@/utils/Draw';

type ILocation = {};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 10, span: 14 },
};

const Demo: React.FC<ILocation> = (props: ILocation) => {
  const [form] = Form.useForm();
  const {locationInfo, setMapLoaction, chanageCollapsed } = useModel('useCesiumMap');
  const handler = useMemo(() => {return new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);}, []);

  useEffect(() => {
      getPosition(window.viewer, handler, ['LEFT_CLICK'], (result: any) => {
        const position = { long: result.longitudeString, lat: result.latitudeString, height: result.height};
        setMapLoaction(position);
        form.setFieldsValue(position);
        addBillboard(window.viewer, position);
      });

    return () => {
      window.viewer.entities.removeAll();
    };
  }, []);

  const addBillboard = (viewer: any, position: IMapLoaction) => {
    removeEntityByNames(viewer, ['locationMap']);
    viewer.entities.add({
      name: 'locationMap',
      position: Cesium.Cartesian3.fromDegrees(
        Number(position.long),
        Number(position.lat),
        Number(0),
      ),
      billboard: {
        image: require('../../assets/img/location.png'),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
  };

  const closeHandler = () => {
    chanageCollapsed(true);
    window.viewer?.entities?.removeAll();
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };

  const locationHandler = () => {
    const long = form.getFieldValue('long');
    const lat = form.getFieldValue('lat');
    const height = form.getFieldValue('height');
    var position = Cesium.Cartesian3.fromDegrees(Number(long), Number(lat), Number(height),)
    const viewer = window.viewer as Cesium.Viewer;
    viewer.entities.add(
      new Cesium.Entity({
        id: 'model_1',
        position: position,
        model: {
          uri: "/SampleData/办公楼.glb",
          scale: 10,
        },
      }),
    );
    viewer.flyTo(window.viewer.entities);
  };

  const handleViewerLoaded = async () => {
    const viewer = window.viewer as Cesium.Viewer;
    // const canvas = viewer.canvas;
    // canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
    // canvas.addEventListener("click", function () {
    //   canvas.focus();
    // });
    // canvas.focus();

    const scene = viewer.scene;

    const pathPosition = new Cesium.SampledPositionProperty();
    viewer.entities.add({
      position: pathPosition,
      name: "path",
      path: {
        show: true,
        leadTime: 0,
        trailTime: 60,
        width: 10,
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          taperPower: 0.3,
          color: Cesium.Color.PALEGOLDENROD,
        }),
      },
    });
    const camera = viewer.camera;
    const controller = scene.screenSpaceCameraController;
    let r = 0;
    const hpRoll = new Cesium.HeadingPitchRoll();
    const hpRange = new Cesium.HeadingPitchRange();
    let speed = 150;
    const deltaRadians = Cesium.Math.toRadians(3.0);
    let position = Cesium.Cartesian3.fromDegrees(121.4, 24, 5000.0);
    let speedVector = new Cesium.Cartesian3();
    const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

    const model = await Cesium.Model.fromGltf({
      url: "/SampleData/models/CesiumAir/Cesium_Air.glb",
      scale: 128,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform
      ),
      // minimumPixelSize: 128,
      asynchronous: false,
    });

    try {
          const planePrimitive = scene.primitives.add(model);
          model.readyPromise.then(()=>{
            // Play and loop all animations at half-speed
            planePrimitive.activeAnimations.addAll({
              multiplier: 0.5,
              loop: Cesium.ModelAnimationLoop.REPEAT,
            });
            // Zoom to model
            r = 2.0 * Math.max(planePrimitive.boundingSphere.radius, camera.frustum.near);
            controller.minimumZoomDistance = r * 0.5;
            const center = planePrimitive.boundingSphere.center;
            const heading = Cesium.Math.toRadians(230.0);
            const pitch = Cesium.Math.toRadians(-20.0);
            hpRange.heading = heading;
            hpRange.pitch = pitch;
            hpRange.range = r * 50.0;
            // camera.lookAt(center, hpRange);
            // viewer.flyTo(window.viewer.entities);
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(121.4, 24.1, 50000.0),
              orientation: {
                heading: Cesium.Math.toRadians(360),
                pitch: Cesium.Math.toRadians(-90),
                roll: Cesium.Math.toRadians(0),
              },
              duration: 5,
              complete: function callback() {
                // 定位完成之后的回调函数
              },
            });
          });

          document.addEventListener("keydown", function (e) {
            switch (e.keyCode) {
              case 40:
                if (e.shiftKey) {
                  // speed down
                  speed = Math.max(--speed, 1);
                } else {
                  // pitch down
                  hpRoll.pitch -= deltaRadians;
                  if (hpRoll.pitch < -Cesium.Math.TWO_PI) {
                    hpRoll.pitch += Cesium.Math.TWO_PI;
                  }
                }
                break;
              case 38:
                if (e.shiftKey) {
                  // speed up
                  speed = Math.min(++speed, 100);
                } else {
                  // pitch up
                  hpRoll.pitch += deltaRadians;
                  if (hpRoll.pitch > Cesium.Math.TWO_PI) {
                    hpRoll.pitch -= Cesium.Math.TWO_PI;
                  }
                }
                break;
              case 39:
                if (e.shiftKey) {
                  // roll right
                  hpRoll.roll += deltaRadians;
                  if (hpRoll.roll > Cesium.Math.TWO_PI) {
                    hpRoll.roll -= Cesium.Math.TWO_PI;
                  }
                } else {
                  // turn right
                  hpRoll.heading += deltaRadians;
                  if (hpRoll.heading > Cesium.Math.TWO_PI) {
                    hpRoll.heading -= Cesium.Math.TWO_PI;
                  }
                }
                break;
              case 37:
                if (e.shiftKey) {
                  // roll left until
                  hpRoll.roll -= deltaRadians;
                  if (hpRoll.roll < 0.0) {
                    hpRoll.roll += Cesium.Math.TWO_PI;
                  }
                } else {
                  // turn left
                  hpRoll.heading -= deltaRadians;
                  if (hpRoll.heading < 0.0) {
                    hpRoll.heading += Cesium.Math.TWO_PI;
                  }
                }
                break;
              default:
            }
          });
          viewer.scene.preUpdate.addEventListener(function (scene, time) {
            speedVector = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_X, speed / 10, speedVector);
            position = Cesium.Matrix4.multiplyByPoint(planePrimitive.modelMatrix, speedVector, position);
            pathPosition.addSample(Cesium.JulianDate.now(), position);
            Cesium.Transforms.headingPitchRollToFixedFrame(position, hpRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform, planePrimitive.modelMatrix);
          });
        } catch (error) {
          console.log(`Error loading model: ${error}`);
        }
  }

  const car = () => {
    const viewer = window.viewer as Cesium.Viewer;
    const czmlPath = "/SampleData/";
    let vehicleEntity;

    // Add a blank CzmlDataSource to hold our multi-part entity/entities.
    const dataSource = new Cesium.CzmlDataSource();
    viewer.dataSources.add(dataSource);

    // This demo shows how a single path can be broken up into several CZML streams.
    const partsToLoad = [
      {
        url: "MultipartVehicle_part1.czml",
        range: [0, 1500],
        requested: false,
        loaded: false,
      },
      {
        url: "MultipartVehicle_part2.czml",
        range: [1500, 3000],
        requested: false,
        loaded: false,
      },
      {
        url: "MultipartVehicle_part3.czml",
        range: [3000, 4500],
        requested: false,
        loaded: false,
      },
    ];


    // Helper function to mark a part as requested, and process it into the dataSource.
    function processPart(part: { url: any; range?: number[]; requested: any; loaded: any; }) {
      part.requested = true;
      dataSource.process(czmlPath + part.url).then(function () {
        part.loaded = true;
        // Follow the vehicle with the camera.
        if (!viewer.trackedEntity) {
          viewer.trackedEntity = vehicleEntity = dataSource.entities.getById("Vehicle");
        }
      });
    }

    // Load the first part up front.
    processPart(partsToLoad[0]);

    // Load a new section before the clock naturally gets there.
    // Note this can't predict when a user may fast-forward to it.
    const preloadTimeInSeconds = 100;

    viewer.clock.onTick.addEventListener(function (clock) {
      // This example uses time offsets from the start to identify which parts need loading.
      const timeOffset = Cesium.JulianDate.secondsDifference(
        clock.currentTime,
        clock.startTime
      );

      // Filter the list of parts to just the ones that need loading right now.
      // Then, process each part that needs loading.
      partsToLoad.filter(function (part) {
          return (
            !part.requested &&
            timeOffset >= part.range[0] - preloadTimeInSeconds &&
            timeOffset <= part.range[1]
          );
        }).forEach(function (part) {
          processPart(part);
        });
    });
  }

  const carTwo = () => {
    const viewer = window.viewer as Cesium.Viewer;

    //Make sure viewer is at the desired time.
    const start = Cesium.JulianDate.fromDate(new Date(2018, 11, 12, 15));
    const totalSeconds = 10;
    const stop = Cesium.JulianDate.addSeconds(
      start,
      totalSeconds,
      new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.timeline.zoomTo(start, stop);

    // Create a path for our vehicle by lerping between two positions.
    const position = new Cesium.SampledPositionProperty();
    const startPosition = new Cesium.Cartesian3(
      -2379556.799372864,
      -4665528.205030263,
      3629813.106599678
    );
    const endPosition = new Cesium.Cartesian3(
      -2379603.7074103747,
      -4665623.48990283,
      3629813.82704567
    );
    // A velocity vector property will give us the entity's speed and direction at any given time.
    const velocityVectorProperty = new Cesium.VelocityVectorProperty(
      position,
      false
    );
    const velocityVector = new Cesium.Cartesian3();
    // Store the wheel's rotation over time in a SampledProperty.
    const wheelAngleProperty = new Cesium.SampledProperty(Number);
    let wheelAngle = 0;

    const numberOfSamples = 100;
    for (let i = 0; i <= numberOfSamples; ++i) {
      const factor = i / numberOfSamples;
      const time = Cesium.JulianDate.addSeconds(
        start,
        factor * totalSeconds,
        new Cesium.JulianDate()
      );

      // Lerp using a non-linear factor so that the vehicle accelerates.
      const locationFactor = Math.pow(factor, 2);
      const location = Cesium.Cartesian3.lerp(
        startPosition,
        endPosition,
        locationFactor,
        new Cesium.Cartesian3()
      );
      position.addSample(time, location);
      // Rotate the wheels based on how fast the vehicle is moving at each timestep.
      velocityVectorProperty.getValue(time, velocityVector);
      const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector);
      const wheelRadius = 0.52; //in meters.
      const circumference = Math.PI * wheelRadius * 2;
      const rotationsPerSecond = metersPerSecond / circumference;

      wheelAngle += ((Math.PI * 2 * totalSeconds) / numberOfSamples) * rotationsPerSecond;
      wheelAngleProperty.addSample(time, wheelAngle);
    }

    function updateSpeedLabel(time: Cesium.JulianDate | undefined, result: any) {
      velocityVectorProperty.getValue(time, velocityVector);
      const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector);
      const kmPerHour = Math.round(metersPerSecond * 3.6);
      return `${kmPerHour} km/hr`;
    }

    const rotationProperty = new Cesium.CallbackProperty(function (time, result) {
      return Cesium.Quaternion.fromAxisAngle(
        Cesium.Cartesian3.UNIT_X,
        wheelAngleProperty.getValue(time),
        result
      );
    },
    false);

    const wheelTransformation = new Cesium.NodeTransformationProperty({
      rotation: rotationProperty,
    });

    const nodeTransformations = {
      Wheels: wheelTransformation,
      Wheels_mid: wheelTransformation,
      Wheels_rear: wheelTransformation,
    };

    // Add our vehicle model.
    const vehicleEntity = viewer.entities.add({
      position: position,
      orientation: new Cesium.VelocityOrientationProperty(position), // Automatically set the vehicle's orientation to the direction it's facing.
      model: {
        // uri: "/SampleData/models/GroundVehicle/GroundVehicle.glb",
        uri: "/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb",
        runAnimations: false,
        // nodeTransformations: nodeTransformations,
      },
      label: {
        text: new Cesium.CallbackProperty(updateSpeedLabel, false),
        font: "20px sans-serif",
        showBackground: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
        eyeOffset: new Cesium.Cartesian3(0, 3.5, 0),
      },
    });

    viewer.trackedEntity = vehicleEntity;
    // vehicleEntity.viewFrom = new Cesium.Cartesian3(-10.0, 7.0, 4.0);

  }
  const clear = () => {
    console.log("onClick")
    const viewer = window.viewer;
    viewer.entities.removeAll();
    viewer.scene.primitives.removeAll();
  }
  return (
    <>
      <>
        <CustomModal title={'位置定位'} onCancel={closeHandler}>
          <Form
            {...layout}
            form={form}
            name="control-hooks"
            initialValues={{
              long: locationInfo.long,
              lat: locationInfo.lat,
              height: locationInfo.height,
            }}
          >
            <Form.Item name="long" label="经度">
              <InputNumber<string> style={{ width: 200 }} min="0" step="0.0001" stringMode/>
            </Form.Item>
            <Form.Item name="lat" label="纬度">
              <InputNumber<string> style={{ width: 200 }} min="0" step="0.0001" stringMode/>
            </Form.Item>
            <Form.Item name="height" label="高度">
              <InputNumber<string> style={{ width: 200 }} min="0" step="1" stringMode/>
            </Form.Item>
            <Form.Item >
              <Button onClick={handleViewerLoaded}>飞机</Button>
              <Button onClick={car}>车</Button>
              <Button onClick={carTwo}>车2</Button>
              <Button onClick={locationHandler}>办公楼</Button>
              <Button onClick={clear}>全部清除</Button>
            </Form.Item>
          </Form>
        </CustomModal>
      </>
    </>
  );
};

export default Demo;
