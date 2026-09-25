import { ReactNode } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = {
  children: ReactNode;
  extraHeight?: number;
  verticalIndicator?: boolean;
  fullHeight?: boolean;
};

const KeyboardAvoidingScroll = ({
  children,
  extraHeight = 150,
  verticalIndicator = false,
  fullHeight = false,
}: Props) => (
  <KeyboardAwareScrollView
    contentContainerStyle={{ flexGrow: fullHeight ? 1 : 0 }}
    extraHeight={extraHeight}
    indicatorStyle="black"
    showsVerticalScrollIndicator={verticalIndicator}
    showsHorizontalScrollIndicator={false}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  </KeyboardAwareScrollView>
);

export { KeyboardAvoidingScroll };
