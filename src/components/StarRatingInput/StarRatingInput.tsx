import { getTestId } from '@helpers';
import { CrownIcon } from '../CrownIcon/CrownIcon';
import { Star, StarInputContainer } from './styles';

export const StarRatingInput = ({
  setRate,
  rate = 5,
  mv = 0,
}: {
  setRate: (val: number) => void;
  rate: number;
  mv: number;
}) => (
  <StarInputContainer mv={mv}>
    {[...Array(5)].map((_, i) => (
      <Star testID={getTestId(`star-${i + 1}`)} onPress={() => setRate(i + 1)}>
        <CrownIcon
          size={24}
          color={rate >= i + 1 ? 'warning' : 'grey300'}
        />
      </Star>
    ))}
  </StarInputContainer>
);
