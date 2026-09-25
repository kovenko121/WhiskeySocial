import React from 'react';
import { Text } from '@components';
import { SeparatorContainer, SeparatorLine, SeparatorTextContainer } from './styles';

type Props = {
  date: string;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return DAY_NAMES[date.getDay()];

  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const DateSeparator = ({ date }: Props) => (
  <SeparatorContainer>
    <SeparatorLine />
    <SeparatorTextContainer>
      <Text size={11} color="grey200">
        {formatDateLabel(date)}
      </Text>
    </SeparatorTextContainer>
    <SeparatorLine />
  </SeparatorContainer>
);

export default React.memo(DateSeparator);
