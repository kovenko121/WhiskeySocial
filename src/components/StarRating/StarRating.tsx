/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import { CrownIcon } from '../CrownIcon/CrownIcon';
import { Star, StarContainer } from './styles';

export const StarRating = ({
  amount,
  disabled = false,
  setValue,
}: {
  amount: number;
  disabled?: boolean;
  setValue?: number;
}) => {
  const [starRating, setStarRating] = useState(setValue || 1);

  return (
    <StarContainer>
      {[...Array(amount)].map((_, i) => (
        <Star key={i} disabled={disabled} onPress={() => setStarRating(i + 1)}>
          <CrownIcon
            size={16}
            color={starRating >= i + 1 ? 'warning' : 'grey300'}
          />
        </Star>
      ))}
    </StarContainer>
  );
};
