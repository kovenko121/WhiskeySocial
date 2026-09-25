import { S3Object } from '@types';
import { DefaultTheme } from 'styled-components/native';
import { useSignedImage } from '../../data/useSignedImage';
import { brandInitials } from '../../utils';
import { Badge, BadgeInitials, BadgeLogo } from './styles';

type Props = {
  name: string;
  size: number;
  dark?: boolean;
  logo?: S3Object | null;
};

export const BrandBadge = ({ name, size, dark = false, logo }: Props) => {
  const initialsSize = Math.round(size * 0.34);
  const tone: keyof DefaultTheme['colors'] = dark ? 'white' : 'grey500';
  const { source, onError } = useSignedImage(logo, { subject: 'brandBadge', brand: name });

  return (
    <Badge size={size} dark={dark}>
      {source && <BadgeLogo source={source} size={size} onError={onError} />}
      {!source && (
        <BadgeInitials tone={tone} fontSize={initialsSize}>
          {brandInitials(name)}
        </BadgeInitials>
      )}
    </Badge>
  );
};
