import { ReactNode, useEffect, useState } from 'react';
import CesiumView from '../components/CesiumView';
import * as Cesium from 'cesium';
import { useModel } from 'umi';
import '../global.less';
import styles from './index.less';
import { applyPolyfills, defineCustomElements,} from '@esri/calcite-components/dist/loader';
import '@esri/calcite-components/dist/calcite/calcite.css';
import Measure from '@/components/Measure';
import BaseMap from '@/components/BaseMap';
import MapLocation from '@/components/Location';
import Layer from '@/components/Layer';
import {CalciteAction, CalciteActionBar, CalciteActionGroup, CalciteFlow, CalciteShell, CalciteShellPanel,} from '@esri/calcite-components-react';
import BookMark from './BookMark';
import Navigation from './Navigation';
import ExportScene from './ExportScene';
import { initHandler } from '@/utils/layerUtils';
import SplitScreen from './SplitScreen';
import Draw from './Draw';
import _ from 'lodash';
import Satellite from '@/components/Satellite';
import Test2 from '@/components/Satellite/test';

applyPolyfills().then(() => {
  defineCustomElements(window);
});


export default function IndexPage() {
  const { collapsed, chanageCollapsed, changeMenuType } = useModel('useCesiumMap');

  const [actionType, setActionType] = useState<string>('');
  const [headerTitle, setHeaderTitle] = useState<string>('');
  const [ expanded, setExpanded] = useState(false);

  let Panel: ReactNode = null;
  const panel: any = {
    baseMap: <BaseMap />,
    measure: <Measure />,
    location: <MapLocation />,
    layer: <Layer />,
    bookmark: <BookMark />,
    navigation: <Navigation />,
    print: <ExportScene />,
    splitScreen: <SplitScreen />,
    draw: <Draw />,
    demo: <Satellite />,
    test2: <Test2 />,
  };
  const clickHandler = (e: any) => {
    const type: string = e.target.getAttribute('data-type');
    const title: string = e.target.getAttribute('text');
    changeMenuType(type);
    if (type) {
      if (type === 'roller') {
        setActionType(type);
        chanageCollapsed(true);
      } else {
        Panel = panel[type];
        setActionType(type);
        setHeaderTitle(title);
        chanageCollapsed(false);
      }
    }
  };

  useEffect(() => {
    if (actionType === 'roller' && window.viewer01 && window.viewer02) {
      initHandler(window.viewer01, window.viewer02);
    } else {
    }
  }, [actionType, window.viewer01, window.viewer02]);

  return (
    <>
      <CalciteShell>
        <CalciteShellPanel
          id="shellPanel"
          slot="primary-panel"
          position="start"
          detached={false}
          collapsed={collapsed}
          className={styles.bgColor}
        >
          <CalciteActionBar
            slot="action-bar"
            expanded={expanded}
            onCalciteActionBarToggle = {()=>{
              setExpanded(!expanded);
            }}
            intlCollapse={"关闭"}
            onClick={(e) => {
              clickHandler(e);
            }}
          >
            <CalciteActionGroup>
              <CalciteAction text="demo" icon="layers" data-type="demo" />
              <CalciteAction text="test2" icon="layers" data-type="test2" />
            </CalciteActionGroup>
            {/* <CalciteActionGroup>
              <CalciteAction title="底图" text="底图" icon="basemap" data-type="baseMap"/>
              <CalciteAction text="图层" icon="layers" data-type="layer" />
            </CalciteActionGroup> */}
            <CalciteActionGroup>
              <CalciteAction
                text="图上量算"
                icon="measure"
                data-type="measure"
              />
              <CalciteAction
                text="坐标定位"
                icon="gps-on-f"
                data-type="location"
              />
              {/* <CalciteAction text="视角书签" icon="pins" data-type="bookmark" /> */}
            </CalciteActionGroup>

            {/* <CalciteActionGroup>
              <CalciteAction
                text="分屏对比"
                icon="layout-horizontal"
                data-type="roller"
              />
              <CalciteAction
                text="卷帘对比"
                icon="content-small"
                data-type="splitScreen"
              />
            </CalciteActionGroup> */}
            <CalciteActionGroup>
              <CalciteAction
                text="图上标绘"
                icon="annotate-tool"
                data-type="draw"
              />
              {/* <CalciteAction
                text="线路导航"
                icon="tour"
                data-type="navigation"
              /> */}
              {/* <CalciteAction text="地图打印" icon="print" data-type="print" /> */}
            </CalciteActionGroup>
          </CalciteActionBar>

          <CalciteFlow>{panel[actionType]}</CalciteFlow>
        </CalciteShellPanel>
        {actionType === 'roller' ? (
          <div style={{ display: 'flex' }}>
            <CesiumView id="viewer01" style={{ width: '50%' }} />
            <CesiumView id="viewer02" style={{ width: '50%' }} />
          </div>
        ) : (
          <CesiumView />
        )}
      </CalciteShell>
    </>
  );
}
