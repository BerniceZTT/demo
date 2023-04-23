import { Button, Space } from 'antd';
import React, { useEffect } from 'react';
import styles from './index.less';
import * as Cesium from 'cesium';

type IToolBar = {
  viewer: any;
};

const ToolBar: React.FC<IToolBar> = (props: IToolBar) => {
  const { viewer } = props;
  console.log(viewer, 'viewer');

  useEffect(() => {
    const homeButton = new Cesium.HomeButton('HomeButton', viewer?.scene);

    const fullScreenButton = new Cesium.FullscreenButton(
      'fullScreen',
      document.body,
    );
    const VRButton = new Cesium.VRButton(
      'VRButton',
      viewer.scene,
      document.body,
    );
    const sceneModePicker = new Cesium.SceneModePicker(
      'sceneModePicker',
      viewer.scene,
    );
  }, []);
  return (
    <>
      {' '}
      <div className={styles.toolBar}>
        <Space direction="vertical">
          <div id="HomeButton"></div>
          <div id="sceneModePicker"></div>

          <div id="sceneModePicker"></div>
          <div id="fullScreen" className={styles.toolBarBtn}></div>
          <div id="VRButton" className={styles.toolBarBtn}></div>
        </Space>
      </div>
    </>
  );
};

export default ToolBar;
