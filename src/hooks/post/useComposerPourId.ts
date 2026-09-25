import { randomUUID } from 'expo-crypto';
import { useEffect, useRef } from 'react';

const useComposerPourId = (visible: boolean) => {
  const pourIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (visible) {
      pourIdRef.current = randomUUID();
    }
  }, [visible]);

  return () => {
    if (!pourIdRef.current) {
      pourIdRef.current = randomUUID();
    }
    return pourIdRef.current;
  };
};

export { useComposerPourId };
