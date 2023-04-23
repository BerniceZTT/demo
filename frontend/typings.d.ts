declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.less';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
declare module 'lodash';

interface Window {
  CESIUM_BASE_URL: string;
  viewer: any;
  viewer01: any;
  viewer02: any;
}
