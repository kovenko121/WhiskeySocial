import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@helpers';

export const useBottomPadding = (minAndroidPadding = 25) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const resolveBottomPadding = () => {
    if (keyboardVisible) return 0;
    if (isAndroid) return Math.max(insets.bottom, minAndroidPadding);
    return insets.bottom;
  };

  const bottomPadding = resolveBottomPadding();

  return { bottomPadding, keyboardVisible };
};