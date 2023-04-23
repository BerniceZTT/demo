import { Button, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import * as Cesium from 'cesium';
import CustomModal from '../CustomModal';
import { useModel } from 'umi';
import Draw from '@/utils/Draw';
import { flyTo } from '@/utils/utils';

type IMeasure = {};
const Measure: React.FC<IMeasure> = (props: IMeasure) => {
  const { chanageCollapsed } = useModel('useCesiumMap');

  const handleMenuClick = (e: any) => {
    const draw = new Draw(window.viewer);
    draw.drawLineGraphics({ measure: true });
  };
  const handleClickArea = () => {
    const draw = new Draw(window.viewer);
    draw.drawPolygonGraphics({ measure: true });
  };

  useEffect(() => {
    flyTo(104.067863, 30.659537, 2685, () => {});

    return () => {
      (window.viewer as Cesium.Viewer).dataSources.removeAll();
    };
  }, []);

  const closeHandler = () => {
    chanageCollapsed(true);
  };
  return (
    <CustomModal title={'图上量算'} onCancel={closeHandler}>
      <div>
        <Space>
          <Tooltip placement="bottom" title={'测量距离'}>
            <Button onClick={handleMenuClick}>
              <calcite-icon scale="m" icon="measure-line"></calcite-icon>
            </Button>
          </Tooltip>
          <Tooltip placement="bottom" title={'测量面积'}>
            <Button onClick={handleClickArea}>
              <calcite-icon scale="m" icon="measure-area"></calcite-icon>
            </Button>
          </Tooltip>
          {/* <Tooltip placement="bottom" title={'测量高度'}>
            <Button
              onClick={() => {
                const draw = new Draw(window.viewer);
                draw.clear();
              }}
            >
              <calcite-icon scale="m" icon="antenna-height"></calcite-icon>
            </Button>
          </Tooltip> */}
          <Tooltip placement="bottom" title={'清除'}>
            <Button
              onClick={() => {
                const draw = new Draw(window.viewer);
                draw.clear();
              }}
            >
              <calcite-icon icon="trash" scale="m"></calcite-icon>
            </Button>
          </Tooltip>
        </Space>
      </div>
      {/* <div className={styles.resultsInfo}>
        <span>{results}</span>
      </div> */}
    </CustomModal>
  );
};

export default Measure;
