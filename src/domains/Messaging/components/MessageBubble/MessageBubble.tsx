import { memo, useCallback } from 'react';
import { Linking, Pressable, Text as RNText, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@components';
import { theme } from '../../../../styles/theme';
import type { MessageItem } from '../../../../hooks/messaging/useMessages';
import {
  BubbleRow,
  BubbleContainer,
  DeletedBubbleContainer,
  TimestampContainer,
} from './styles';

type OptimisticFields = {
  _optimistic?: boolean;
  _status?: 'sending' | 'sent' | 'failed';
};

type ReadReceiptType = 'sent' | 'read' | undefined;

type Props = {
  message: MessageItem & OptimisticFields;
  isOwnMessage: boolean;
  readReceiptType?: ReadReceiptType;
  onLongPress?: () => void;
};

const URL_REGEX = /https?:\/\/[^\s]+/g;

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const renderTextWithLinks = (text: string, isOwn: boolean) => {
  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX);

  if (!urls) {
    return (
      <Text size={14} color={isOwn ? 'white' : 'grey50'}>
        {text}
      </Text>
    );
  }

  const elements: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    if (part) {
      elements.push(
        <Text key={`text-${index}`} size={14} color={isOwn ? 'white' : 'grey50'}>
          {part}
        </Text>,
      );
    }
    if (urls[index]) {
      elements.push(
        <Pressable key={`url-${index}`} onPress={() => Linking.openURL(urls[index]).catch(() => {})}>
          <Text size={14} color={isOwn ? 'grey50' : 'primary500'} underlined>
            {urls[index]}
          </Text>
        </Pressable>,
      );
    }
  });

  return <View>{elements}</View>;
};

const MessageBubble = ({ message, isOwnMessage, readReceiptType, onLongPress }: Props) => {
  const isSending = message._optimistic && message._status === 'sending';

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  }, [onLongPress]);

  if (message.deletedForEveryone) {
    return (
      <BubbleRow isOwn={isOwnMessage}>
        <DeletedBubbleContainer>
          <RNText
            style={{
              fontStyle: 'italic',
              fontSize: theme.metrics.px(14),
              color: theme.colors.grey200,
            }}
          >
            This message was deleted
          </RNText>
        </DeletedBubbleContainer>
      </BubbleRow>
    );
  }

  return (
    <View>
      <Pressable onLongPress={handleLongPress} delayLongPress={400} disabled={!onLongPress}>
        <BubbleRow isOwn={isOwnMessage}>
          <BubbleContainer isOwn={isOwnMessage} style={isSending ? { opacity: 0.6 } : undefined}>
            {renderTextWithLinks(message.text, isOwnMessage)}
          </BubbleContainer>
        </BubbleRow>
      </Pressable>
      <TimestampContainer isOwn={isOwnMessage}>
        {isSending ? (
          <Text size={10} color="grey300">
            Sending...
          </Text>
        ) : (
          <>
            <Text size={10} color="grey300">
              {formatTime(message.createdAt)}
            </Text>
            {readReceiptType === 'sent' && (
              <Text size={10} color="grey300">
                {' · '}✓
              </Text>
            )}
            {readReceiptType === 'read' && (
              <Text size={10} color="primary500">
                {' · Read'}
              </Text>
            )}
          </>
        )}
      </TimestampContainer>
    </View>
  );
};

export default memo(MessageBubble);
