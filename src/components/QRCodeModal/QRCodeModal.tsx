import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { createLogger } from '../../services/logger';
import {
  createShareLink,
  ShareLinkType,
} from '../../helpers/createShareLink';
import { Button } from '../Button/Button';
import { ModalBottom } from '../ModalBottom/ModalBottom';
import {
  CaptureContainer,
  CaptureTitleText,
  CaptureUrlText,
  ClipboardButton,
  ModalContent,
  QRCodeContainer,
  SaveButtonContainer,
  TitleContainer,
} from './styles';

const logger = createLogger('QRCodeModal');

type QRCodeModalProps = {
  visible: boolean;
  onClose: () => void;
  url: string;
  title: string;
  loading?: boolean;
};

export const QRCodeModal = ({
  visible,
  onClose,
  url,
  title,
  loading = false,
}: QRCodeModalProps) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy URL to clipboard:', error as Error);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture QR code.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Save QR Code',
      });
    } catch (err) {
      logger.error('Failed to share QR code:', err as Error);
      Alert.alert('Error', 'Failed to share QR code.');
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <ModalContent>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <CaptureContainer>
            <TitleContainer>
              <CaptureTitleText>{title}</CaptureTitleText>
            </TitleContainer>
            <QRCodeContainer>
              {loading || !url ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <QRCode
                  value={url}
                  size={220}
                  backgroundColor="white"
                  color="black"
                />
              )}
            </QRCodeContainer>
            {!loading && url ? (
              <ClipboardButton onPress={handleCopy} isCopied={copied}>
                <CaptureUrlText numberOfLines={2}>{url}</CaptureUrlText>
              </ClipboardButton>
            ) : null}
          </CaptureContainer>
        </ViewShot>
        <SaveButtonContainer>
          <Button
            label="Share QR Code"
            icon="download"
            variant="outlineDefault"
            onPress={handleSave}
            loading={saving}
            disabled={loading || !url}
            full
          />
          <Button label="Done" variant="default" onPress={onClose} full />
        </SaveButtonContainer>
      </ModalContent>
    </ModalBottom>
  );
};

type AdminQRCodeProps = {
  type: ShareLinkType;
  id: string;
  title: string;
};

export const useAdminQRCode = ({ type, id, title }: AdminQRCodeProps) => {
  const [visible, setVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const showQRCode = () => {
    setShareUrl(createShareLink({ type, id }));
    setVisible(true);
  };

  const hideQRCode = () => {
    setVisible(false);
    setShareUrl('');
  };

  const QRModal = () => (
    <QRCodeModal
      visible={visible}
      onClose={hideQRCode}
      url={shareUrl}
      title={title}
      loading={false}
    />
  );

  return { showQRCode, QRModal };
};
