import { ImageSourcePropType } from 'react-native';
import { Icon } from '@components';
import { theme } from '@theme';
import { TileKind } from '../types';
import { DashedBorder } from '../Passport/components/DistillerTile/DashedBorder';
import { GlassOverlay } from '../Passport/components/DistillerTile/GlassOverlay';
import {
  TipFavBadge,
  TipGlassAnchor,
  TipLogo,
  TipTile,
  TipTileSlot,
  TipTileTokens,
} from './styles';

type Props = {
  kind: TileKind;
  logo: ImageSourcePropType;
  glassLevel?: 1 | 2 | 3;
  fav?: boolean;
};

// Mirrors DistillerTile: the backdrop and the logo are constant, and only the border separates the
// states, so the tutorial shows the same treatment the grid does.
const tokensFor = (kind: TileKind): TipTileTokens => {
  switch (kind) {
    case 'visited':
      return {
        bg: theme.colors.white,
        borderColor: theme.colors.primary500,
        borderWidth: 2,
        borderStyle: 'solid',
      };
    case 'togo':
      return {
        bg: theme.colors.white,
        borderColor: theme.colors.toGoGreen,
        borderWidth: 2,
        borderStyle: 'dashed',
      };
    case 'notyet':
    default:
      return {
        bg: theme.colors.white,
        borderColor: theme.colors.grey300,
        borderWidth: 1,
        borderStyle: 'solid',
      };
  }
};

export const TipTilePreview = ({ kind, logo, glassLevel, fav }: Props) => {
  const tokens = tokensFor(kind);

  return (
    <TipTileSlot>
      <TipTile tokens={tokens}>
        <TipLogo source={logo} />
        {tokens.borderStyle === 'dashed' && (
          <DashedBorder
            radius={theme.metrics.px(6)}
            color={tokens.borderColor}
            strokeWidth={theme.metrics.px(tokens.borderWidth)}
          />
        )}
        {glassLevel && (
          <TipGlassAnchor>
            <GlassOverlay level={glassLevel} size={32} />
          </TipGlassAnchor>
        )}
        {fav && (
          <TipFavBadge>
            <Icon name="heart" size={9} color="red" />
          </TipFavBadge>
        )}
      </TipTile>
    </TipTileSlot>
  );
};
