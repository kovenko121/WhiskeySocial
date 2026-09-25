import * as Font from 'expo-font';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { EBGaramond_400Regular } from '@expo-google-fonts/eb-garamond';
import Icons from '../../assets/fonts/ws.ttf';

const loadFonts = () =>
  Font.loadAsync({
    DMSans_400Regular,
    DMSans_700Bold,
    EBGaramond_400Regular,
    ws: Icons,
  });

export { loadFonts };
