import React, { useEffect, useState } from 'react';
import styles from './index.less';
import * as Cesium from 'cesium';
import { getCesiumScale } from '@/utils/utils';

type IScale = {
  viewer: any;
};

const Scale: React.FC<IScale> = (props: IScale) => {
  const { viewer } = props;
  const { scene } = viewer;
  const [distanceLabel, setDistanceLabel] = useState<string>('');
  const [barWidth, setBarWidth] = useState<string | number>('');

  useEffect(() => {
    // 场景变化监听事件
    viewer.scene.postRender.addEventListener(function () {
      getCesiumScale(
        viewer,
        (value: { width: string | number; distanceLabel: string }) => {
          setBarWidth(value.width);
          setDistanceLabel(value.distanceLabel);
        },
      );
    });
  }, []);

  return (
    <div className={styles['scale-container']}>
      <div className={styles['scale-label']}>
        {distanceLabel || '>1000km'}
      </div>
      <div
        className={styles['scale-bar']}
        style={{ width: barWidth + 'px' }}
      ></div>
    </div>
  );
};

export default Scale;
