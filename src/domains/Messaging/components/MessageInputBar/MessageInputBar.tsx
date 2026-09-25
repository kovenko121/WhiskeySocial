import { memo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Text } from '@components';
import {
  InputBarContainer,
  TextInputContainer,
  StyledTextInput,
  SendButton,
  CharCountContainer,
} from './styles';
import { theme } from '../../../../styles/theme';

const MAX_CHARS = 2000;
const COUNTER_THRESHOLD = 1900;

type Props = {
  onSend?: (text: string) => void;
  errorMessage?: string | null;
  isSending?: boolean;
};

const MessageInputBar = ({ onSend, errorMessage, isSending }: Props) => {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  const trimmed = text.trim();
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showCounter = charCount > COUNTER_THRESHOLD;
  const isDisabled = trimmed.length === 0 || isOverLimit || !!isSending;

  const handleSend = () => {
    if (isDisabled || !onSend) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <>
      {errorMessage && (
        <Text size={12} color="red" align="center">
          {errorMessage}
        </Text>
      )}
      {showCounter && (
        <CharCountContainer>
          <Text size={11} color={isOverLimit ? 'red' : 'grey300'}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </Text>
        </CharCountContainer>
      )}
      <InputBarContainer style={{ paddingBottom: Math.max(insets.bottom, theme.metrics.px(8)) }}>
        <TextInputContainer>
          <StyledTextInput
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.grey200}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={MAX_CHARS}
            textAlignVertical="top"
          />
        </TextInputContainer>
        <SendButton disabled={isDisabled} onPress={handleSend}>
          <Icon name="right" size={16} color={isDisabled ? 'grey200' : 'white'} />
        </SendButton>
      </InputBarContainer>
    </>
  );
};

export default memo(MessageInputBar);
