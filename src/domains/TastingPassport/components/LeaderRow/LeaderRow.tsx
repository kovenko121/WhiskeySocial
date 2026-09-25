import { getTestId } from '@helpers';
import { LeaderboardRow } from '../../types';
import { BrandBadge } from '../BrandBadge/BrandBadge';
import {
  Bottle,
  Brand,
  Count,
  CountBlock,
  CountInline,
  CountLabel,
  LeaderRowVariant,
  Meta,
  Rank,
  RankCircle,
  RowContainer,
} from './styles';

type Props = {
  row: LeaderboardRow;
  onPress?: () => void;
  variant?: LeaderRowVariant;
};

export const LeaderRow = ({ row, onPress, variant = 'full' }: Props) => (
  <RowContainer variant={variant} onPress={onPress} testID={getTestId(`leaderboard-row-${row.rank}`)}>
    <RankCircle variant={variant}>
      <Rank>{row.rank}</Rank>
    </RankCircle>
    <BrandBadge
      name={row.brand}
      size={variant === 'preview' ? 32 : 36}
      logo={row.image}
    />
    <Meta>
      <Brand numberOfLines={1}>{row.brand.toUpperCase()}</Brand>
      <Bottle variant={variant} numberOfLines={1}>
        {row.bottle}
      </Bottle>
    </Meta>
    {variant === 'preview' && <CountInline>{row.count} tastes</CountInline>}
    {variant === 'full' && (
      <CountBlock>
        <Count>{row.count}</Count>
        <CountLabel>tastes</CountLabel>
      </CountBlock>
    )}
  </RowContainer>
);
