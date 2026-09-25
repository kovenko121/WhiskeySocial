/**
 * The white tile on a "Your Pours Tonight" card: the bottle's product shot with the brand's
 * logo sitting over its top-left corner.
 *
 * Both images degrade independently — the design system this came from treats the glass mark
 * as the tile's fallback, not its default, and the chip falls back to brand initials the same
 * way the booth badges do. A curated pour with no CMS bottle shot keeps the glass.
 */
import { Icon } from '@components';
import { S3Object } from '@types';
import { useSignedImage } from '../../../data/useSignedImage';
import { brandInitials } from '../../../utils';
import {
  BottleImage,
  BrandChip,
  BrandChipLogo,
  BrandChipText,
  ProductTile,
} from './styles';

type Props = {
  brand: string;
  image?: S3Object | null;
  brandImage?: S3Object | null;
};

export const ProductShot = ({ brand, image, brandImage }: Props) => {
  const bottle = useSignedImage(image, { subject: 'bottleShot', brand });
  const logo = useSignedImage(brandImage, { subject: 'pourBrandLogo', brand });

  return (
    <ProductTile>
      {bottle.source && (
        <BottleImage source={bottle.source} onError={bottle.onError} />
      )}
      {!bottle.source && (
        <Icon name="wine" size={36} color="grey300" />
      )}
      <BrandChip>
        {logo.source && (
          <BrandChipLogo source={logo.source} onError={logo.onError} />
        )}
        {!logo.source && <BrandChipText>{brandInitials(brand)}</BrandChipText>}
      </BrandChip>
    </ProductTile>
  );
};
