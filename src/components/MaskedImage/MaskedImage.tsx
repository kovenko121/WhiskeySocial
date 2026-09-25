import { CircularImage } from './styles';

export const MaskedImage = ({ img }: { img: any }) => (
  <CircularImage source={img} resizeMode="cover" />
);
