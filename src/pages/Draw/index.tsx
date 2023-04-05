import CustomModal from '@/components/CustomModal';
import {
  exportScene,
  flyTo,
  getPosition,
  removeEntityByNames,
  screenshots,
} from '@/utils/utils';
import {
  AimOutlined,
  BorderOutlined,
  LineOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { Button, Col, Collapse, Form, Input, message, Row, Space } from 'antd';
import * as Cesium from 'cesium';
import React, { useEffect, useMemo, useState } from 'react';
import { request, useModel } from 'umi';
import Draw from '@/utils/Draw';

interface Props {}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const Index: React.FC<Props> = () => {
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

    return () => {
      (window.viewer as Cesium.Viewer).dataSources.removeAll();
    };
  }, []);

  const exportHandler = () => {};

  const drawHandler = (type: string) => {
    const drawFun = new Draw(window.viewer);
    switch (type) {
      case 'point':
        drawFun.drawPointGraphics();
        break;
      case 'polyline':
        drawFun.drawLineGraphics();
        break;
      case 'polygon':
        drawFun.drawPolygonGraphics();
        break;
      case 'clear':
        drawFun.clear();
        break;
    }
  };

  return (
    <div>
      <CustomModal title={'图上标绘'} onCancel={closeHandler}>
        <div>
          <Space>
            <Button
              icon={<AimOutlined />}
              type="primary"
              onClick={() => {
                drawHandler('point');
              }}
            >
              点
            </Button>
            <Button
              icon={<LineOutlined />}
              type="primary"
              onClick={() => {
                drawHandler('polyline');
              }}
            >
              线
            </Button>
            <Button
              icon={<BorderOutlined />}
              type="primary"
              onClick={() => {
                drawHandler('polygon');
              }}
            >
              面
            </Button>
            <Button
              icon={<ClearOutlined />}
              type="primary"
              onClick={() => {
                drawHandler('clear');
              }}
            >
              清除
            </Button>
          </Space>
        </div>
      </CustomModal>
    </div>
  );
};

export default Index;
