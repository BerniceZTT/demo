import { Avatar, Button, Dropdown, List, Menu, Radio, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.less';
import * as Cesium from 'cesium';
import Scale from '../Scale';
import CustomModal from '../CustomModal';
import { IBaseMapType } from '@/pages/inteface';
import { config } from '../../config';
import { loadArcgisMap } from '@/utils/layerUtils';
import { drawPolygon } from '@/utils/analyize';

type IBaseMap = {};

const BaseMap: React.FC<IBaseMap> = (props: IBaseMap) => {
  const { baseMapType, setBaseMapType, chanageCollapsed } =
    useModel('useCesiumMap');

  const clickHandler = (e: any) => {
    const key = e.currentTarget.getAttribute('data-key');
    setBaseMapType(key);
    loadArcgisMap(
      window.viewer,
      config.esriBasemapDefinitions[key].baseMapLayers,
    );
  };
  const closeHandler = () => {
    chanageCollapsed(true);
  };
  return (
    <CustomModal title={'底图'} onCancel={closeHandler}>
      <div className={styles.listPanel}>
        {/* <Button
          type="primary"
          onClick={() => {
            drawPolygon(window.viewer);
          }}
        >
          绘图
        </Button> */}
        <ul>
          {Object.values(config.esriBasemapDefinitions).map(
            (item: any) =>
              item.display && (
                <li
                  key={item.id}
                  className={item.id === baseMapType ? styles.active : ''}
                  data-key={item.id}
                  onClick={(e) => clickHandler(e)}
                >
                  <Space>
                    <Avatar
                      shape="square"
                      src={item.thumbnailUrl}
                      size="large"
                    />
                    <h4>{item.text}</h4>
                  </Space>
                </li>
              ),
          )}
        </ul>
      </div>
    </CustomModal>
  );
};

export default BaseMap;
