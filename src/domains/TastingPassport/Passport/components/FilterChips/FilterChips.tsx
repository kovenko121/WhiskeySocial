/**
 * Grid filter chips — Not Yet / To Go / Visited / Poured. Single-select: one filter active at a
 * time; tapping the active chip clears it (product decision — supersedes the earlier OR'd
 * multi-select in state-model rule 5). `active` stays an array (0 or 1 entry) so the matching
 * logic is unchanged. A local chip row rather than the shared `TagFilter`.
 */
import { getTestId } from '@helpers';
import { FilterChip } from '../../../types';
import { Chip, ChipLabel, Row } from './styles';

type Props = {
  active: FilterChip[];
  onToggle: (chip: FilterChip) => void;
};

const CHIPS: Array<{ key: FilterChip; label: string }> = [
  { key: 'notyet', label: 'Not Yet' },
  { key: 'togo', label: 'Want to Go' },
  { key: 'went', label: 'Visited' },
  { key: 'poured', label: 'Poured' },
];

export const FilterChips = ({ active, onToggle }: Props) => (
  <Row horizontal showsHorizontalScrollIndicator={false}>
    {CHIPS.map(({ key, label }) => {
      const isActive = active.includes(key);
      return (
        <Chip
          key={key}
          active={isActive}
          onPress={() => onToggle(key)}
          testID={getTestId(`passport-filter-${key}`)}
        >
          <ChipLabel active={isActive}>{label}</ChipLabel>
        </Chip>
      );
    })}
  </Row>
);
