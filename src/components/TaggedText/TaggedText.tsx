import React from 'react';
import { Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InlineTag, InlineTagType, NavigationProps, Routes } from '@types';
import { useAuth } from '@contexts';
import { Text } from '../Text/Text';

interface TaggedTextProps {
  content: string;
  tags: InlineTag[];
  size?: number;
  color?: string;
}

export const TaggedText: React.FC<TaggedTextProps> = ({
  content,
  tags,
  size = 14,
  color = 'white',
}) => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const sub = user?.sub;

  const handleTagPress = (tag: InlineTag) => {
    switch (tag.type) {
      case InlineTagType.USER:
        if (tag.entityId === sub) {
          navigation.navigate(Routes.MyCollection);
        } else {
          navigation.navigate(Routes.UserProfile, { id: tag.entityId });
        }
        break;
      case InlineTagType.VENUE:
        navigation.navigate(Routes.UserProfile, { id: tag.entityId });
        break;
      case InlineTagType.BRAND:
        navigation.navigate(Routes.UserProfile, { id: tag.entityId });
        break;
      case InlineTagType.WHISKEY:
        navigation.navigate(Routes.WhiskeyInfo, { id: tag.entityId });
        break;
      default:
        break;
    }
  };

  if (!tags || tags.length === 0) {
    return (
      <Text size={size} color={color as any}>
        {content}
      </Text>
    );
  }

  // Sort tags by startIndex to ensure proper order
  const sortedTags = [...tags].sort((a, b) => a.startIndex - b.startIndex);

  const elements: React.JSX.Element[] = [];
  let lastIndex = 0;

  sortedTags.forEach((tag, index) => {
    // Add text before the tag
    if (tag.startIndex > lastIndex) {
      elements.push(
        <Text key={`text-${index}`} size={size} color={color as any}>
          {content.substring(lastIndex, tag.startIndex)}
        </Text>
      );
    }

    // Add the tagged text as a clickable link
    elements.push(
      <Text
        key={`tag-${index}`}
        size={size}
        color="primary500"
        bold
        onPress={() => handleTagPress(tag)}
      >
        {content.substring(tag.startIndex, tag.endIndex)}
      </Text>
    );

    lastIndex = tag.endIndex;
  });

  // Add remaining text after the last tag
  if (lastIndex < content.length) {
    elements.push(
      <Text key="text-end" size={size} color={color as any}>
        {content.substring(lastIndex)}
      </Text>
    );
  }

  return <RNText>{elements}</RNText>;
};
