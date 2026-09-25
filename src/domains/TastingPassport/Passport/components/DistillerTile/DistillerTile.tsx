import { getTestId } from '@helpers';
import { Icon } from '@components';
import { theme } from '@theme';
import { DefaultTheme } from 'styled-components/native';
import { useSignedImage } from '../../../data/useSignedImage';
import { glassFillLevel, resolveTileKind } from '../../../state/stateMachine';
import { Booth, BoothStatus, BrandDetail, TileKind } from '../../../types';
import { boothLogo, brandInitials, visitedChipLabel } from '../../../utils';
import { DashedBorder } from './DashedBorder';
import { GlassOverlay } from './GlassOverlay';
import {
  Cell,
  ChipRow,
  ChipText,
  FavBadge,
  GlassAnchor,
  Initials,
  Name,
  StatusChip,
  Tile,
  TileLogo,
  TileRing,
  TileTokens,
} from './styles';

type Props = {
  booth: Booth;
  status: BoothStatus;
  tastedCount: number;
  brand?: BrandDetail;
  onPress: () => void;
};

const tileTokens = (kind: TileKind, darkLogo: boolean): TileTokens => {
  // One backdrop for every state. The states differ by their border and their chip alone — never by
  // what sits behind the logo, and never by the logo's own strength.
  const bg = darkLogo ? theme.colors.backgroundDark : theme.colors.white;

  switch (kind) {
    case 'visited':
      return {
        bg,
        borderColor: theme.colors.primary500,
        borderWidth: 2,
        borderStyle: 'solid',
        chipColor: 'warning',
        chipBorderColor: theme.colors.primary500,
        chipBorderWidth: 2,
        chipBorderStyle: 'solid',
      };
    case 'togo':
      return {
        bg,
        borderColor: theme.colors.toGoGreen,
        // 2px, not the spec's 3px: a dashed SVG stroke reads heavier than a solid border of the
        // same weight.
        borderWidth: 2,
        borderStyle: 'dashed',
        chipColor: 'toGoGreen',
        chipBorderColor: theme.colors.toGoGreen,
        chipBorderWidth: 2,
        chipBorderStyle: 'dashed',
      };
    case 'notyet':
    default:
      return {
        bg,
        borderColor: theme.colors.grey300,
        borderWidth: 1,
        borderStyle: 'solid',
        chipColor: 'grey200',
        chipBorderColor: theme.colors.grey300,
        chipBorderWidth: 1,
        chipBorderStyle: 'solid',
      };
  }
};

// Full-strength ink in every state, matching the logo it stands in for.
const initialsTone = (darkLogo: boolean): keyof DefaultTheme['colors'] =>
  darkLogo ? 'white' : 'grey500';

const chipLabel = (kind: TileKind, tastedCount: number): string => {
  if (kind === 'visited') return visitedChipLabel(tastedCount);
  if (kind === 'togo') return 'Want';
  return 'Not Yet';
};

export const DistillerTile = ({ booth, status, tastedCount, brand, onPress }: Props) => {
  const kind = resolveTileKind(status);
  const tokens = tileTokens(kind, booth.darkLogo);
  // The booth snapshot wins: a brand renamed for this event keeps the event name.
  const displayName = booth.name || brand?.brandName || '';

  const { source: logoSource, onError: onLogoError } = useSignedImage(boothLogo(booth, brand), {
    subject: 'boothLogo',
    boothId: booth.id,
    brand: displayName,
  });

  return (
    <Cell onPress={onPress} testID={getTestId(`passport-tile-${booth.id}`)}>
      <TileRing>
        <Tile tokens={tokens}>
          {logoSource && <TileLogo source={logoSource} onError={onLogoError} />}
          {!logoSource && (
            <Initials tone={initialsTone(booth.darkLogo)}>{brandInitials(displayName)}</Initials>
          )}
          {tokens.borderStyle === 'dashed' && (
            <DashedBorder
              radius={theme.metrics.px(8)}
              color={tokens.borderColor}
              strokeWidth={theme.metrics.px(tokens.borderWidth)}
            />
          )}
          {kind === 'visited' && (
            <GlassAnchor>
              <GlassOverlay level={glassFillLevel(tastedCount)} />
            </GlassAnchor>
          )}
        </Tile>
      </TileRing>
      <ChipRow>
        <StatusChip tokens={tokens}>
          {tokens.chipBorderStyle === 'dashed' && (
            <DashedBorder
              radius={theme.metrics.px(100)}
              color={tokens.chipBorderColor}
              strokeWidth={theme.metrics.px(tokens.chipBorderWidth)}
            />
          )}
          <ChipText tone={tokens.chipColor}>{chipLabel(kind, tastedCount)}</ChipText>
        </StatusChip>
        {status.fav && (
          <FavBadge>
            <Icon name="heart" size={10} color="red" />
          </FavBadge>
        )}
      </ChipRow>
      <Name>{displayName}</Name>
    </Cell>
  );
};
