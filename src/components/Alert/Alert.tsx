import { Alert as NativeAlert } from 'react-native';

const Alert = (
  title: string,
  message: string,
  onCancel?: () => void,
  onOk?: () => void
) =>
  NativeAlert.alert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
    { text: 'OK', onPress: onOk },
  ]);

export { Alert };
