import { message, Modal } from 'antd';

// 封装消息弹框，编译后期自定义弹框内容/样式
declare type ConfigContent = React.ReactNode | string;
declare type JointContent = ConfigContent | ArgsProps;
declare type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';
declare type ConfigDuration = number | (() => void);
declare type ConfigOnClose = () => void;

interface ArgsProps {
  content: React.ReactNode;
  duration: number | null;
  type: NoticeType;
  prefixCls?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  key?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

let msgModal;
const renderMsg = (type: NoticeType, content: ConfigContent) => {
  if (!msgModal) {
    msgModal = Modal.error({
      title: '提示',
      content,
      okText: '关闭',
      className: 'msg-modal',
      maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
      centered: true,
      onOk: () => {
        msgModal = null;
      },
      autoFocusButton: null,
      okType: 'default',
    });
  }
};

export const customMessage = {
  success: (
    content: JointContent,
    duration?: number,
    onClose?: ConfigOnClose,
  ) => {
    return message.success(content, duration, onClose);
  },
  info: (content: JointContent, duration?: number, onClose?: ConfigOnClose) => {
    return message.info(content, duration, onClose);
  },
  warning: (
    content: JointContent,
    duration?: number,
    onClose?: ConfigOnClose,
  ) => {
    return message.warning(content, duration, onClose);
  },
  warn: (content: JointContent, duration?: number, onClose?: ConfigOnClose) => {
    return message.warn(content, duration, onClose);
  },
  loading: (
    content: JointContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
  ) => {
    return message.loading(content, duration, onClose);
  },
  error: (content: JointContent) => {
    return renderMsg(
      'error',
      (content as any).content ? (content as any).content : content,
    );
  },
  destroy: () => {
    message.destroy();
  },
};
