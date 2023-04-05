import CustomModal from '@/components/CustomModal';
import {
  exportScene,
  flyTo,
  getPosition,
  removeEntityByNames,
  screenshots,
} from '@/utils/utils';
import _ from 'lodash';
import { Button, Col, Collapse, Form, Input, message, Row, Space } from 'antd';
import * as Cesium from 'cesium';
import React, { useEffect, useMemo, useState } from 'react';
import { request, useModel } from 'umi';

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
  }, []);

  const exportHandler = () => {
    exportScene(window.viewer);
  };

  return (
    <div>
      <CustomModal title={'地图打印'} onCancel={closeHandler}>
        <Button type="primary" onClick={exportHandler}>
          导出
        </Button>
      </CustomModal>
    </div>
  );
};

export default Index;
