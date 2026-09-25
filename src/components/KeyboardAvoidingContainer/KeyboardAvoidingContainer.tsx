import { isIos } from '@helpers';
import { ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type Props = {
  children: ReactNode;
};

const KeyboardAvoidingContainer = ({ children }: Props) => (
  <KeyboardAvoidingView
    behavior={isIos ? 'padding' : 'height'}
    style={{
      flex: 1,
    }}
    keyboardVerticalOffset={isIos ? 0 : 20}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
       <View style={{ flex: 1 }}>{children}</View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

export { KeyboardAvoidingContainer };
