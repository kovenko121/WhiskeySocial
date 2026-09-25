import { createNumberMask } from 'react-native-mask-input';

export const dollarMask = createNumberMask({
  prefix: ['$'],
  delimiter: ',',
  separator: '.',
  precision: 2,
});
