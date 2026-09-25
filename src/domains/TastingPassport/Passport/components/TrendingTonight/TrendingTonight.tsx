/**
 * "Trending Tonight" section on the Passport: a section label with a "Full leaderboard ›" link
 * and the top 3 leaderboard rows. Tapping any row or the link opens the Leaderboard.
 *
 * The section holds its place before anyone has tasted anything — early in the night the board
 * is legitimately empty, and a placeholder says so rather than leaving a gap in the layout.
 */
import { getTestId } from '@helpers';
import { LeaderRow } from '../../../components/LeaderRow/LeaderRow';
import { LeaderboardRow } from '../../../types';
import {
  Container,
  EmptyCard,
  EmptyText,
  Header,
  Label,
  Link,
  Rows,
} from './styles';

type Props = {
  rows: LeaderboardRow[];
  onOpenLeaderboard: () => void;
};

export const TrendingTonight = ({ rows, onOpenLeaderboard }: Props) => (
  <Container>
    <Header>
      <Label>TRENDING TONIGHT</Label>
      <Link onPress={onOpenLeaderboard} testID={getTestId('passport-full-leaderboard')}>
        Full leaderboard ›
      </Link>
    </Header>
    {rows.length === 0 && (
      <EmptyCard testID={getTestId('passport-trending-empty')}>
        <EmptyText>
          No bottles on the board yet. Mark a pour as tasted to start the count.
        </EmptyText>
      </EmptyCard>
    )}
    {rows.length > 0 && (
      <Rows>
        {rows.map((row) => (
          <LeaderRow
            key={row.rank}
            row={row}
            variant="preview"
            onPress={onOpenLeaderboard}
          />
        ))}
      </Rows>
    )}
  </Container>
);
