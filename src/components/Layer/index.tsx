import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  Radio,
  Space,
  Tooltip,
  Tree,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import * as Cesium from 'cesium';
import { useModel } from 'umi';
import CustomModal from '../CustomModal';
import config from './config';
import { add3dTile, zoomToTileset } from '@/utils/layerUtils';
import Entity from 'cesium/Source/DataSources/Entity';
import { flyTo, KMLLayer, loadGeojson, WMSLayer } from '@/utils/utils';
import _ from 'lodash';

type ILayer = {};

let addArcgisLayer = {} as Cesium.ImageryLayer;
let wfsLayer = {} as Cesium.ImageryLayer;

const Layer: React.FC<ILayer> = (props: ILayer) => {
  const { chanageCollapsed, selectLayer, changeSelectLayer } =
    useModel('useCesiumMap');

  const checkedKeys = selectLayer?.checkedNodes.map((item: any) => item.key);

  const closeHandler = () => {
    chanageCollapsed(true);
  };
  const onCheck = (checkedKeysValue: React.Key[], info: any) => {
    console.log('onCheck', checkedKeysValue);
    console.log('onCheck', info);
    changeSelectLayer(info);

    const viewer = window.viewer as Cesium.Viewer;

    const model1 = viewer.entities.getById('model_1');
    if (info?.node?.type === 'gltf') {
      if (info.checked) {
        if (model1) {
          model1.show = true;
        } else {
          viewer.entities.add(
            new Entity({
              id: 'model_1',
              position: Cesium.Cartesian3.fromDegrees(
                102.801504,
                24.962751,
                10,
              ),
              model: {
                uri: info?.node?.url,
                scale: 100,
              },
            }),
          );
        }
      } else {
        if (model1) {
          model1.show = false;
        }
      }

      viewer.flyTo(window.viewer.entities);
    } else if (info?.node?.type === 'mapserver') {
      if (info?.checked) {
        if (!_.isEmpty(addArcgisLayer)) {
          viewer.imageryLayers.remove(addArcgisLayer);
        }
        let ArcgisLayer = new Cesium.ArcGisMapServerImageryProvider({
          url: info?.node?.url,
        });
        addArcgisLayer = viewer.imageryLayers.addImageryProvider(ArcgisLayer);
      } else {
        addArcgisLayer.show = false;
      }
      flyTo(117.511435, 31.738532, 44586);
    } else if (info?.node?.type === 'geojson') {
      const geojsonLayer = viewer.dataSources.getByName('geojsonLayer');
      if (info?.checked) {
        if (geojsonLayer?.length > 0) {
          geojsonLayer[0].show = true;
          viewer.flyTo(geojsonLayer[0]);
        } else {
          const layer = loadGeojson(info?.node?.url, 'geojsonLayer', {
            fill: Cesium.Color.fromCssColorString('#225908'),
            strokeWidth: 0,
          });
          viewer.dataSources.add(layer);

          viewer.flyTo(layer);
        }
      } else {
        if (geojsonLayer.length > 0) {
          geojsonLayer[0].show = false;
        }
      }
    } else if (info?.node?.type === '3dtile') {
      const primitives = window.viewer.scene.primitives._primitives;
      const LoadData = primitives.filter(
        (el: any) => el._url === info?.node?.url,
      );
      if (info.checked && LoadData.length > 0) {
        LoadData[0].show = true;
        zoomToTileset(LoadData[0], window.viewer);
      }

      if (info.checked && info?.node?.url && LoadData.length === 0) {
        add3dTile(window.viewer, info?.node);
        return;
      }

      if (LoadData.length > 0 && !info.checked) {
        LoadData[0].show = false;
        zoomToTileset(LoadData[0], window.viewer);
      }
    } else if (info?.node?.type === 'wfs') {
      if (info?.checked) {
        if (!_.isEmpty()) {
          viewer.imageryLayers.remove(wfsLayer);
        }
        const layer = WMSLayer({
          url: 'http://server.mars3d.cn/geoserver/mars/wms',
          layers: 'mars:hf',
          parameters: {
            transparent: 'true',
            format: 'image/png',
            srs: 'EPSG:4326',
          },
        });
        wfsLayer = viewer.imageryLayers.addImageryProvider(layer);
      } else {
        wfsLayer.show = false;
      }
      flyTo(117.511435, 31.738532, 44586);
    } else if (info?.node?.key === 'kml') {
      const geojsonLayer = viewer.dataSources.getByName('kmlLayer');
      if (info?.checked) {
        if (geojsonLayer?.length > 0) {
          geojsonLayer[0].show = true;
          viewer.flyTo(geojsonLayer[0]);
        } else {
          const layer = KMLLayer(info?.node?.url, 'kmlLayer', {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: true, //开启贴地
          });
          viewer.dataSources.add(layer);

          viewer.flyTo(layer);
        }
      } else {
        if (geojsonLayer.length > 0) {
          geojsonLayer[0].show = false;
        }
      }
    }
  };

  return (
    <CustomModal title={'图层'} onCancel={closeHandler}>
      <div>
        <Tree
          checkable
          treeData={config.layerData}
          defaultExpandAll
          onCheck={onCheck}
          checkedKeys={checkedKeys}
        />
      </div>
    </CustomModal>
  );
};

export default Layer;
