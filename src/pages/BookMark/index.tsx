import CustomModal from '@/components/CustomModal';
import { Avatar, Button, Card, Input, message, Space, Tooltip } from 'antd';
import * as Cesium from 'cesium';
import React, { useRef } from 'react';
import { useModel } from 'umi';
import {
  EditOutlined,
  EllipsisOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { screenshots } from '@/utils/utils';
import { MarkBook } from '../inteface';

interface Props {}
const { Meta } = Card;

const Index: React.FC<Props> = () => {
  const inputRef = useRef(null as any);
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

  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
  const addMarkBook = () => {
    console.log(inputRef);
    const value = inputRef.current?.input.value;
    if (!value) {
      message.warn('请输入书签名称');
      return;
    }
    if (markBookData.filter((el) => el.title === value).length === 1) {
      message.warn('书签名称不能重复!');
      return;
    }
    window.viewer.render(); //重新渲染界面

    var canvas = (window.viewer as Cesium.Viewer).scene.canvas;
    var image = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    var blob = dataURLtoBlob(image);
    var objurl = URL.createObjectURL(blob);
    var link = document.createElement('a');
    // link.download = 'scene.png';
    // link.href = objurl;
    // link.click();
    const heading = Cesium.Math.toDegrees(window.viewer.camera.heading);
    const pitch = Cesium.Math.toDegrees(window.viewer.camera.pitch);
    const roll = Cesium.Math.toDegrees(window.viewer.camera.roll);
    const cartographic = window.viewer.camera.positionCartographic;
    const { height, longitude, latitude } = cartographic;

    const result = {
      height,
      longitude: Cesium.Math.toDegrees(longitude),
      latitude: Cesium.Math.toDegrees(latitude),
      heading,
      pitch,
      roll,
      title: value,
    };
    changeMarkBook({ ...result, image: objurl });
    inputRef.current.input.value = '';
  };

  const locationHandler = (el: MarkBook) => {
    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        el.longitude,
        el.latitude,
        el.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(el.heading || 0.0),
        pitch: Cesium.Math.toRadians(el.pitch || -15.0), //倾斜角度
        roll: el.roll || 0.0,
      },
      // duration:1.5//动画持续时间
      complete: () => {
        //飞行结束之后执行的方法
      },
    });
  };

  const deleteMarbookHandler = (el: MarkBook) => {
    changeMarkBook(el, true);
  };
  return (
    <div>
      <CustomModal title={'视角书签'} onCancel={closeHandler}>
        <div style={{ marginBottom: 10 }}>
          <Space>
            <Input ref={inputRef} style={{ width: 'calc(100% - 5px)' }} />
          </Space>
          <Button type="primary" onClick={addMarkBook}>
            添加书签
          </Button>
        </div>
        <div
          style={{
            overflowY: 'auto',
            height: '80vh',
            padding: '10px 10px 10px 0px',
          }}
        >
          {markBookData.map((el) => (
            <Card
              hoverable
              style={{ width: '100%', marginBottom: 10 }}
              cover={<img alt="example" src={el.image} />}
              actions={[
                <Tooltip title="定位">
                  <EnvironmentOutlined
                    key="setting"
                    onClick={() => {
                      locationHandler(el);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="删除">
                  <DeleteOutlined
                    key="edit"
                    onClick={() => {
                      deleteMarbookHandler(el);
                    }}
                  />
                  ,
                </Tooltip>,
              ]}
            >
              <Meta title={el.title} />
            </Card>
          ))}
        </div>
      </CustomModal>
    </div>
  );
};

export default Index;
