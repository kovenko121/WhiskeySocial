import { Icons } from '@types';
import { DefaultTheme } from 'styled-components/native';
import { capitalize, capitalizeAll } from '../../helpers';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import {
  CloseContainer,
  IconContainer,
  TagContainer,
  TagsContainer,
} from './styles';

export const Tag = ({
  text,
  selected = false,
  close = false,
  icon = '',
  backgroundColor = 'primary',
  borderColor = 'primary500',
  ellipsis = false,
}: {
  text: string;
  selected?: boolean;
  icon?: string;
  close?: boolean;
  backgroundColor?: keyof DefaultTheme['colors'];
  borderColor?: keyof DefaultTheme['colors'];
  ellipsis?: boolean;
}) => (
  <TagContainer
    selected={selected}
    backgroundColor={backgroundColor}
    borderColor={borderColor}
  >
    {icon && (
      <IconContainer>
        <Icon name={icon as Icons} size={16} color="white" />
      </IconContainer>
    )}
    <Text
      size={12}
      numberOfLines={ellipsis ? 1 : undefined}
      ellipsizeMode={ellipsis ? 'tail' : undefined}
    >
      {capitalizeAll(text?.split('_').join(' '))}
    </Text>
    {close && selected && (
      <CloseContainer>
        <Icon name="close" size={12} color="primary500" />
      </CloseContainer>
    )}
  </TagContainer>
);

export const Tags = ({
  variant = false,
  data = [],
  tagBackgroundColor,
}: {
  variant?: boolean;
  data?: string[];
  tagBackgroundColor?: string;
}) => (
  <TagsContainer>
    {data &&
      data.map((key) => (
        <Tag
          key={key}
          selected={!variant}
          backgroundColor={tagBackgroundColor}
          text={capitalize(key)}
        />
      ))}
  </TagsContainer>
);
