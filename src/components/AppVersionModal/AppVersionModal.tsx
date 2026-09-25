import React from 'react';
import { Linking, Platform } from 'react-native';
import Modal from 'react-native-modal';
import styled from 'styled-components/native';
import { AppVersionCheckResult } from '@hooks';
import { createLogger } from '../../services/logger';

const logger = createLogger('AppVersionModal');

const Container = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 20px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 16px;
`;

const Message = styled.Text`
  font-size: 16px;
  color: #4a4a4a;
  text-align: center;
  margin-bottom: 8px;
  line-height: 22px;
`;


const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.TouchableOpacity<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  background-color: ${(props: { variant: 'primary' | 'secondary' }) => props.variant === 'primary' ? '#007AFF' : '#E5E5E5'};
  margin: 0 6px;
`;

const ButtonText = styled.Text<{ variant: 'primary' | 'secondary' }>`
  color: ${(props: { variant: 'primary' | 'secondary' }) => props.variant === 'primary' ? 'white' : '#333333'};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const VersionInfo = styled.Text`
  font-size: 12px;
  color: #999999;
  text-align: center;
  margin-top: 16px;
`;

interface AppVersionModalProps {
  visible: boolean;
  versionInfo: AppVersionCheckResult | undefined;
  onClose?: () => void;
}

const AppVersionModal: React.FC<AppVersionModalProps> = ({
  visible,
  versionInfo,
  onClose,
}) => {
  if (!versionInfo) return null;

  const handleUpdate = async () => {
    if (versionInfo.updateUrl) {
      try {
        const canOpen = await Linking.canOpenURL(versionInfo.updateUrl);
        if (canOpen) {
          await Linking.openURL(versionInfo.updateUrl);
        } else {
          // Fallback to browser if deep link doesn't work
          const webUrl = Platform.select({
            ios: 'https://apps.apple.com',
            android: 'https://play.google.com/store',
            default: '',
          });
          if (webUrl) {
            await Linking.openURL(webUrl);
          }
        }
      } catch (error) {
        logger.error('Error opening update URL:', error as Error);
      }
    }
  };

  const isForceUpdate = versionInfo.forceUpdate;
  const title = isForceUpdate ? 'Update Required' : 'Update Available';
  const message = isForceUpdate
    ? 'A new version of the app is required to continue. Please update to the latest version.'
    : 'A new version of the app is available with improvements and new features.';

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.5}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={isForceUpdate ? undefined : onClose}
      onBackButtonPress={isForceUpdate ? undefined : onClose}
    >
      <Container>
        <Title>{title}</Title>
        <Message>{message}</Message>
        
        <ButtonContainer>
          {!isForceUpdate && (
            <Button variant="secondary" onPress={onClose}>
              <ButtonText variant="secondary">Later</ButtonText>
            </Button>
          )}
          <Button variant="primary" onPress={handleUpdate}>
            <ButtonText variant="primary">Update Now</ButtonText>
          </Button>
        </ButtonContainer>
        
        <VersionInfo>
          Current: v{versionInfo.currentVersion} | Latest: v{versionInfo.latestVersion}
        </VersionInfo>
      </Container>
    </Modal>
  );
};

export { AppVersionModal };