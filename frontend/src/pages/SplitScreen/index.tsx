import CustomModal from '@/components/CustomModal';
import {
  flyTo,
  getPosition,
  removeEntityByNames,
  splitScreenHandler,
} from '@/utils/utils';
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

let layerImage = {} as Cesium.ImageryLayer;

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
    const sliderDom = document.getElementById('slider');
    chanageCollapsed(true);
    if (sliderDom) {
      sliderDom.style.display = 'block';
    }

    splitScreenHandler(window.viewer, (layer) => {
      layerImage = layer;
    });

    return () => {
      if (sliderDom) {
        sliderDom.style.display = 'none';
        (window.viewer as Cesium.Viewer).imageryLayers.remove(layerImage);
      }
    };
  }, []);

  return (
    <div>
      <CustomModal title={''} onCancel={closeHandler}>
        <div></div>
      </CustomModal>
    </div>
  );
};

export default Index;
