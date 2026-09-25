import { Linking } from "react-native";
import { isIos } from "./consts";

const openPhone = (phone: string) => {
  if (isIos) {
    Linking.openURL(`telprompt:${phone}`);
  } else {
    Linking.openURL(`tel:${phone}`);
  }
};

export { openPhone };