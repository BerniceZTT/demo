import { Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import * as Cesium from 'cesium';
import Scale from '../Scale';
import { getPosition } from '@/utils/utils';

type ILongLatInfo = {
  viewer: any;
};

const LongLatInfo: React.FC<ILongLatInfo> = (props: ILongLatInfo) => {
  const { viewer } = props;
  const { scene } = viewer;
  const [info, setInfo] = useState<string>('');
  useEffect(() => {
    const handler = new Cesium.ScreenSpaceEventHandler(
      window.viewer.scene.canvas,
    );
    getPosition(viewer, handler, ['MOUSE_MOVE', 'WHEEL'], (results: any) => {
      const { longitudeString, latitudeString, height, heading, pitch, roll } =
        results;
      setInfo(
        `经度：${longitudeString}  纬度：${latitudeString}  高度：${height}   俯仰角：${Cesium.Math.toDegrees(
          parseFloat(pitch),
        ).toFixed(1)}   偏航角：${Cesium.Math.toDegrees(
          parseFloat(heading),
        ).toFixed(1)}  翻滚角：${Cesium.Math.toDegrees(
          parseFloat(roll),
        ).toFixed(1)}`,
      );
    });
  }, []);

  return (
    <>
      {' '}
      <div className={styles.longLatInfo}>
        <div>
          <Scale viewer={viewer} />
        </div>
        <div>{info}</div>
      </div>
    </>
  );
};

export default LongLatInfo;
