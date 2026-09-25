import { Linking } from 'react-native';
import { GeoPoint } from '../types';
import { isIos } from './consts';

const openMap = (geoPoint: GeoPoint, venueName: string) => {
  if (isIos) {
    Linking.openURL(
      `maps://0,0?q=${venueName.replace('&', 'And')}@${geoPoint.lat},${
        geoPoint.lon
      }`
    );
  } else {
    Linking.openURL(`geo:0,0?q=${geoPoint.lat}${geoPoint.lon}(${venueName})`);
  }
};

export { openMap };
