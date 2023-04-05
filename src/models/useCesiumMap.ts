import { IMapLoaction, ISelectLayer, MarkBook } from '@/pages/inteface';
import { useCallback, useState } from 'react';

export default function useCesiumMapModel() {
  const [collapsed, setCollapsed] = useState(true);
  const [baseMapType, setBaseMapType] = useState('');
  const [selectLayer, setSelectLayer] = useState<any>();
  const [locationInfo, setLoaction] = useState<IMapLoaction>({
    long: '116.387775',
    lat: '31.560200',
    height: '34',
  });
  const [menuType, setMenuType] = useState("");

  const [markBookData, setMarkBook] = useState<MarkBook[]>([]);

  const chanageCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  const setMapLoaction = useCallback((value: IMapLoaction) => {
    setLoaction(value);
  }, []);

  const changeSelectLayer = useCallback((value: any) => {
    setSelectLayer(value);
  }, []);

  const changeMarkBook = useCallback((value: MarkBook, flag?: Boolean) => {
    if (flag) {
      // 删除
      setMarkBook((oldValue) =>
        oldValue.filter((el) => el.title !== value.title),
      );
    } else {
      setMarkBook((oldValue) => [...oldValue, value]);
    }
  }, []);

  const changeMenuType = useCallback((value: string) => {
    setMenuType(value);
  }, []);

  return {
    collapsed,
    chanageCollapsed,
    baseMapType,
    setBaseMapType,
    locationInfo,
    setMapLoaction,
    selectLayer,
    changeSelectLayer,
    changeMarkBook,
    markBookData,
    changeMenuType,
    menuType
  };
}
