import { Space, Button, Tabs, Checkbox, Slider } from 'antd';
import CustomModal from '@/components/CustomModal';
import * as Cesium from 'cesium';
import React, { useState } from 'react';
import { useEffect} from 'react';
import { useModel } from 'umi';


interface Props {}
let entity: Cesium.Entity;

let leftDownFlag = false; // 鼠标左键是否按下
let pickedEntity = null; //被选中的Entity
const Test2: React.FC<Props> = () => {
    const { chanageCollapsed, } = useModel('useCesiumMap');
    const closeHandler = () => { chanageCollapsed(true);};
    const [value, setValue] = useState(30);

    const position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706);
    let angle = 1;
    let scale = 1000;
    let ax = Cesium.Cartesian3.UNIT_X;
    var rotationProperty = new Cesium.CallbackProperty(function(time, result) {
      angle += 10.01;
      scale = 100;
      return Cesium.Quaternion.fromAxisAngle(ax, angle, result);
    }, false);

    var transformation = new Cesium.NodeTransformationProperty({
        rotation: rotationProperty
    });

    var nodeTransformations = {
        //Suzanne 是gltf中节点名称，可以使用建模工具查看
        'Suzanne': transformation,
        //可以在这里添加多个节点
    };

    useEffect(() => {
      console.log("nodeTransformations", nodeTransformations);
      //添加model
      entity = (window.viewer as Cesium.Viewer).entities.add({
        position : position,
        name: "飞机",
        model : {
            uri : '/SampleData/models/weixin.gltf',
            runAnimations : false,
            scale: scale,
            nodeTransformations : nodeTransformations
        },
      });
      console.log("entity", entity)
    }, []);

  //旋转
    function rotatex(){
      console.log("x", Cesium.Cartesian3.UNIT_X)
        ax = Cesium.Cartesian3.UNIT_X;
        console.log("entity", entity)
        // if(entity?.model?.scale){
        //   entity.model.scale += 1000;
        // }
        rotationProperty = new Cesium.CallbackProperty(function(time, result) {
          angle += 50.01;
          return Cesium.Quaternion.fromAxisAngle(ax, angle, result);
        }, false);

      transformation = new Cesium.NodeTransformationProperty({
        rotation: rotationProperty
      });

      nodeTransformations = {
        //Suzanne 是gltf中节点名称，可以使用建模工具查看
        'Suzanne': transformation,
        //可以在这里添加多个节点
      };
      if(entity?.model?.nodeTransformations){
        entity.model.nodeTransformations = nodeTransformations;
      }
    }

    function rotatey(){
        ax = Cesium.Cartesian3.UNIT_Y;
        rotationProperty = new Cesium.CallbackProperty(function(time, result) {
          angle += 10.01;
          return Cesium.Quaternion.fromAxisAngle(ax, angle, result);
      }, false);
    }

    function rotatez(){
        ax = Cesium.Cartesian3.UNIT_Z;
        rotationProperty = new Cesium.CallbackProperty(function(time, result) {
          angle += 10.01;
          return Cesium.Quaternion.fromAxisAngle(ax, angle, result);
      }, false);
    }

    (window.viewer as Cesium.Viewer).screenSpaceEventHandler.setInputAction((e) => {
      leftDownAction(e);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    function leftDownAction(e: any) {
      leftDownFlag = true;
      let picked = (window.viewer as Cesium.Viewer).scene.pick(e.position);
      if (picked) {
        pickedEntity = Cesium.defaultValue(picked.id, picked.primitive.id);
        console.log("pickedEntity", pickedEntity.name)

        if (pickedEntity instanceof Cesium.Entity && pickedEntity.model) {
          pickedEntity.model.scale += 2000;
          //锁定相机
          (window.viewer as Cesium.Viewer).scene.screenSpaceCameraController.enableRotate = false;
        }
      }
    }

    return (
      <div>
        <CustomModal title={'测试2'} onCancel={closeHandler}>
          <div>
            <Space>
              <Button type="primary" onClick={rotatex}>
                X
              </Button>
              <Button type="primary" onClick={rotatey}>
                Y
              </Button>
              <Button type="primary" onClick={rotatez}>
                Z
              </Button>
            </Space>
            <Slider
              value={value}
              onChange={(v)=>{
                setValue(v);
                if(entity?.model?.scale){
                    entity.model.scale = v * 30;
                }
                }} style={{ width: 200 }} />
          </div>
        </CustomModal>
      </div>
    );
}
export default Test2;
