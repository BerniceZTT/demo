import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  Radio,
  Space,
  Tooltip,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import * as Cesium from 'cesium';
import { useModel } from 'umi';
import { getPosition, removeEntityByNames } from '@/utils/utils';
import { IMapLoaction } from '@/pages/inteface';
import CustomModal from '../CustomModal';

type ILocation = {};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 10, span: 14 },
};

const MapLocation: React.FC<ILocation> = (props: ILocation) => {
  const [form] = Form.useForm();
  const { locationInfo, setMapLoaction, chanageCollapsed } =
    useModel('useCesiumMap');
  const handler = useMemo(() => {
    return new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
  }, []);

  useEffect(() => {
    getPosition(window.viewer, handler, ['LEFT_CLICK'], (result: any) => {
      console.log(result);
      const position = {
        long: result.longitudeString,
        lat: result.latitudeString,
        height: result.height,
      };

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
        // scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
        //  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
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
    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        Number(long),
        Number(lat),
        Number(height),
      ),
      orientation: {
        heading: Cesium.Math.toRadians(348.4202942851978),
        pitch: Cesium.Math.toRadians(-89.74026687972041),
        roll: Cesium.Math.toRadians(0.00018078791028219854),
      },
      complete: function callback() {
        // 定位完成之后的回调函数
        addBillboard(window.viewer, { long, lat, height });
      },
    });
  };

  return (
    <CustomModal title={'位置定位'} onCancel={closeHandler}>
      <Form
        {...layout}
        // {...layout}
        form={form}
        name="control-hooks"
        // onFinish={onFinish}
        initialValues={{
          long: locationInfo.long,
          lat: locationInfo.lat,
          height: locationInfo.height,
        }}
      >
        <Form.Item name="long" label="经度">
          <InputNumber<string>
            style={{ width: 200 }}
            min="0"
            step="0.0001"
            stringMode
          />
        </Form.Item>
        <Form.Item name="lat" label="纬度">
          <InputNumber<string>
            style={{ width: 200 }}
            min="0"
            step="0.0001"
            stringMode
          />
        </Form.Item>
        <Form.Item name="height" label="高度">
          <InputNumber<string>
            style={{ width: 200 }}
            min="0"
            step="1"
            stringMode
          />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button onClick={locationHandler}>定位</Button>
        </Form.Item>
      </Form>
    </CustomModal>
  );
};

export default MapLocation;
