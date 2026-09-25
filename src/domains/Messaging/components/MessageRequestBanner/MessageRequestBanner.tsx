import { memo } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { Text } from '@components';
import {
  BannerContainer,
  InfoText,
  ButtonRow,
  AcceptButton,
  DeclineButton,
  BlockButton,
} from './styles';

type Props = {
  recipientName: string;
  onAccept: () => void;
  onDecline: () => void;
  onBlock: () => void;
  isUpdating: boolean;
};

const MessageRequestBanner = ({
  recipientName,
  onAccept,
  onDecline,
  onBlock,
  isUpdating,
}: Props) => {
  const handleDecline = () => {
    Alert.alert(
      'Decline Request',
      `Are you sure you want to decline the message request from @${recipientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: onDecline },
      ],
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${recipientName}? They won't be able to message you or see your profile.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: onBlock },
      ],
    );
  };

  if (isUpdating) {
    return (
      <BannerContainer>
        <ActivityIndicator />
      </BannerContainer>
    );
  }

  return (
    <BannerContainer>
      <InfoText>
        <Text size={13} color="grey50">
          @{recipientName} wants to send you a message
        </Text>
      </InfoText>
      <ButtonRow>
        <AcceptButton onPress={onAccept}>
          <Text size={13} color="white" bold>
            Accept
          </Text>
        </AcceptButton>
        <DeclineButton onPress={handleDecline}>
          <Text size={13} color="white" bold>
            Decline
          </Text>
        </DeclineButton>
        <BlockButton onPress={handleBlock}>
          <Text size={13} color="red" bold>
            Block
          </Text>
        </BlockButton>
      </ButtonRow>
    </BannerContainer>
  );
};

export default memo(MessageRequestBanner);
