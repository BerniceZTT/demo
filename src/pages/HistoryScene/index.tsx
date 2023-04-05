import { Avatar, Button, message, Space } from 'antd';
import React, {  } from 'react';
import { useModel } from 'umi';
import styles from './index.less';
import { config } from '../../config';
import { loadArcgisMap } from '@/utils/layerUtils';
import CustomModal from '@/components/CustomModal';

type IBaseMap = {};

const HistoryScene: React.FC<IBaseMap> = (props: IBaseMap) => {
  const { baseMapType, setBaseMapType, chanageCollapsed } = useModel('useCesiumMap');

  //重置场景
  const clickHandler = (e: any) => {
    message.info("历史场景回看功能")
    // const key = e.currentTarget.getAttribute('data-key');
    // setBaseMapType(key);
    // loadArcgisMap(
    //   window.viewer,
    //   config.esriBasemapDefinitions[key].baseMapLayers,
    // );
  };

  //关闭modal
  const closeHandler = () => {
    chanageCollapsed(true);
  };

  return (
    <CustomModal title={'历史场景'} onCancel={closeHandler}>
      <div className={styles.listPanel}>
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
                    <h4>{item.text + "场景"}</h4>
                    {/* <h4>创建时间</h4> */}
                  </Space>
                </li>
              ),
          )}
        </ul>
      </div>
    </CustomModal>
  );
};

export default HistoryScene;



