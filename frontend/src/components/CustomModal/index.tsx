import React, { ReactNode } from 'react';
import styles from './index.less';

import { CalciteAction, CalcitePanel } from '@esri/calcite-components-react';

type ICustomModal = {
  title: string;
  children: HTMLHtmlElement | ReactNode | Element;
  onCancel?: () => void;
};

const CustomModal: React.FC<ICustomModal> = (props: ICustomModal) => {
  const { title, children, onCancel } = props;

  return (
    <>
      <CalcitePanel heading={title}>
        <CalciteAction
          icon="x"
          text-enabled
          text=""
          slot="header-actions-end"
          onClick={onCancel}
        />
        <div className={styles['content-container']}>{children}</div>
      </CalcitePanel>
    </>
  );
};

export default CustomModal;
