import { useCallback, useState } from 'react';

export default function useCesiumMapModel() {
  const [collapsed, setCollapsed] = useState(true);
  const [baseMapType, setBaseMapType] = useState('');

  const chanageCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  return {
    collapsed,
    chanageCollapsed,
    baseMapType,
    setBaseMapType,
  };
}
