import CustomModal from '@/components/CustomModal';
import { flyTo, getPosition, removeEntityByNames } from '@/utils/utils';
import _ from 'lodash';
import { Button, Col, Collapse, Form, Input, message, Row, Space } from 'antd';
import * as Cesium from 'cesium';
import React, { useEffect, useMemo, useState } from 'react';
import { request, useModel } from 'umi';
import { IMapLoaction } from '../inteface';
var coordtransform = require('coordtransform');

const { Panel } = Collapse;

interface Props {}
let obj: any = {};

let lineLayer = {} as Cesium.CustomDataSource;
const Index: React.FC<Props> = () => {
  const [polylineData, setPolylineData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const {
    locationInfo,
    setMapLoaction,
    chanageCollapsed,
    changeMarkBook,
    markBookData,
  } = useModel('useCesiumMap');
  const closeHandler = () => {
    chanageCollapsed(true);
  };

  useEffect(() => {
    flyTo(104.067863, 30.659537, 2685, () => {});
    lineLayer = new Cesium.CustomDataSource('lineLayer');
    (window.viewer as Cesium.Viewer)?.dataSources.add(lineLayer);

    return () => {
      (window.viewer as Cesium.Viewer).dataSources.removeAll();
      (window.viewer as Cesium.Viewer).entities.removeAll();
    };
  }, []);

  const handler = useMemo(() => {
    return new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
  }, []);

  const drawPoint = (type: 'start' | 'end') => {
    getPosition(window.viewer, handler, ['LEFT_CLICK'], (result: any) => {
      console.log(result);
      const position = {
        long: result.longitudeString,
        lat: result.latitudeString,
        height: result.height,
      };
      if (type === 'start') {
        form.setFieldsValue({ start: `${position.long},${position.lat}` });
      } else {
        form.setFieldsValue({ end: `${position.long},${position.lat}` });
      }
      addBillboard(window.viewer, position, type);
      obj[type] = `${position.long},${position.lat}`;
      if (obj?.start && obj?.end) {
        drawPolyline(obj?.start, obj?.end);
      }
    });
  };

  const addBillboard = (
    viewer: any,
    position: IMapLoaction,
    type: 'start' | 'end',
  ) => {
    removeEntityByNames(viewer, ['locationMap_' + type]);
    viewer.entities.add({
      name: 'locationMap_' + type,
      position: Cesium.Cartesian3.fromDegrees(
        Number(position.long),
        Number(position.lat),
        Number(0),
      ),
      billboard: {
        image: require(`../../assets/img/route-${type}.png`),
        // scaleByDistance: new Cesium.NearFarScalar(300, 1, 1200, 0.4), //设置随图缩放距离和比例
        //  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  const valueChange = (changedValues, allValues) => {
    let start, end;
    if (changedValues?.start) {
      start = changedValues?.start;
      end = allValues?.end;
    }
    if (changedValues?.emd) {
      start = allValues?.start;
      end = changedValues?.end;
    }
    if (start && end) {
      drawPolyline(start, end);
    }
    console.log(changedValues, allValues);
  };

  const drawPolyline = (start: string, end: string) => {
    request('https://restapi.amap.com/v3/direction/driving', {
      method: 'get',
      params: {
        key: '616e615727a1134331ff9459856653f1',
        output: 'json',
        extensions: 'all',
        strategy: 11,
        origin: start,
        destination: end,
      },
    }).then((res) => {
      if (res?.info === 'OK') {
        const polylinePaths = res?.route?.paths;
        let allData: any[] = [];
        lineLayer.entities.removeAll();

        polylinePaths.forEach((el: any, index: number) => {
          let polylinePathsData: any = [];
          el?.steps?.forEach((m) => {
            const gc02CoorArr = m.polyline.split(';');
            gc02CoorArr.forEach((k) => {
              const m = k.split(',');
              var gcj02towgs84 = coordtransform.gcj02towgs84(m[0], m[1]);
              polylinePathsData.push(gcj02towgs84[0], gcj02towgs84[1]);
            });
          });
          allData.push({ distance: el.distance, polyline: polylinePathsData });
          if (!_.isEmpty(lineLayer)) {
            lineLayer.entities.add(
              new Cesium.Entity({
                id: 'line_' + (index + 1),
                name: 'line_' + (index + 1),
                polyline: {
                  positions:
                    Cesium.Cartesian3.fromDegreesArray(polylinePathsData),
                  width: 2,
                  material: Cesium.Color.RED,
                },
              }),
            );
          }
        });
        setPolylineData(allData);
      } else {
        message.warn('查询失败!');
      }

      console.log(res);
    });
  };

  const clickPolylineHandler = (index: number) => {
    const entity = lineLayer.entities.getById(`line_${index}`);
    if (entity) {
      entity.polyline.width = 3;
      entity.polyline.material = Cesium.Color.fromCssColorString('#1df9ea');
    }
  };

  const clearLineHandler = () => {
    (window.viewer as Cesium.Viewer).dataSources.removeAll();
    (window.viewer as Cesium.Viewer).entities.removeAll();

    setPolylineData([]);
  };

  return (
    <div>
      <CustomModal title={'线路导航'} onCancel={closeHandler}>
        <div style={{ overflow: 'hidden' }}>
          <Form
            form={form}
            name="form"
            initialValues={{}}
            onValuesChange={valueChange}
          >
            <Row gutter={24}>
              <Col span={16}>
                {' '}
                <Form.Item label="起点" name="start">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  onClick={() => {
                    drawPoint('start');
                  }}
                >
                  图上选点
                </Button>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <Form.Item label="终点" name="end">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  onClick={() => {
                    drawPoint('end');
                  }}
                >
                  图上选点
                </Button>
              </Col>
            </Row>
            <Button
              type="primary"
              style={{ margin: 30 }}
              onClick={clearLineHandler}
            >
              清除
            </Button>
          </Form>
        </div>
        <div>
          <Collapse defaultActiveKey={['0']}>
            {polylineData.map((el, index) => (
              <Panel header={`路线方案${index + 1}`} key={index}>
                <p>总距离{el.distance / 1000} 公里</p>
                <Button
                  onClick={() => {
                    clickPolylineHandler(index + 1);
                  }}
                >
                  高亮显示
                </Button>
              </Panel>
            ))}
          </Collapse>
        </div>
      </CustomModal>
    </div>
  );
};

export default Index;
