import { Header, Icon, ImageViewerModal } from '@components';
import { getTestId } from '@helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '@types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { createLogger } from '../../../services/logger';
import { LoadError } from '../components/LoadError/LoadError';
import { useSignedImage } from '../data/useSignedImage';
import { useTastingEventContent } from '../data/useTastingEventContent';
import { Booth } from '../types';
import {
  Body,
  Callout,
  CalloutBadge,
  CalloutBadgeNumber,
  CalloutBody,
  CalloutCopy,
  CalloutTitle,
  ChipText,
  Directory,
  DirectoryRow,
  LoadingWrap,
  MapCard,
  MapHint,
  MapImage,
  RowName,
  RowNumber,
  RowNumberText,
  SaveChip,
  Scroll,
  ScreenContainer,
  SectionTitle,
  ZoomHint,
} from './styles';

const logger = createLogger('BoothMap');

const FILE_TYPES: Record<string, { extension: string; mimeType: string; uti: string }> = {
  png: { extension: 'png', mimeType: 'image/png', uti: 'public.png' },
  jpg: { extension: 'jpg', mimeType: 'image/jpeg', uti: 'public.jpeg' },
  jpeg: { extension: 'jpg', mimeType: 'image/jpeg', uti: 'public.jpeg' },
  webp: { extension: 'webp', mimeType: 'image/webp', uti: 'org.webmproject.webp' },
};

const fileTypeFor = (key: string) =>
  FILE_TYPES[key.split('.').pop()?.toLowerCase() ?? ''] ?? FILE_TYPES.png;

const byBoothNumber = (a: Booth, b: Booth) => {
  const left = parseInt(a.boothNumber ?? '', 10);
  const right = parseInt(b.boothNumber ?? '', 10);
  if (!Number.isNaN(left) && !Number.isNaN(right) && left !== right) return left - right;
  return (a.boothNumber ?? '').localeCompare(b.boothNumber ?? '');
};

type ScreenProps = NativeStackScreenProps<RootStackParams, 'BoothMap'>;

export const BoothMapScreen = ({ route }: ScreenProps) => {
  const { eventId } = route.params;
  const { event, loading, failed } = useTastingEventContent(eventId);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const mapImage = event?.mapImage ?? null;
  const { source: mapSource, onError: onMapError } = useSignedImage(mapImage, {
    subject: 'booth map',
  });

  const directory = useMemo(
    () => (event?.booths ?? []).filter((booth) => !!booth.boothNumber).sort(byBoothNumber),
    [event?.booths],
  );

  const hostBoothNumber = event?.hostBoothNumber;

  // Hands the map to the OS share sheet, where "Save Image" puts it in the attendee's photos.
  // The file is downloaded to the cache first: Android's FileProvider will not hand out a
  // content:// URI for anything outside app storage, and iOS wants a real file to type.
  const handleSave = useCallback(async () => {
    if (!mapSource || !mapImage) return;

    setSaving(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Not available', 'Sharing is not available on this device.');
        return;
      }

      if (!FileSystem.cacheDirectory) {
        Alert.alert('Error', 'Could not save the booth map.');
        return;
      }

      const fileType = fileTypeFor(mapImage.key);
      const target = `${FileSystem.cacheDirectory}booth-map.${fileType.extension}`;

      // Redownloaded every time rather than reused from cache: the filename is fixed, so a
      // reissued floor plan would otherwise keep handing out the previous one.
      await FileSystem.deleteAsync(target, { idempotent: true });
      const { status } = await FileSystem.downloadAsync(mapSource.uri, target);
      if (status !== 200) {
        Alert.alert('Error', 'Could not download the booth map.');
        return;
      }

      await Sharing.shareAsync(target, {
        mimeType: fileType.mimeType,
        dialogTitle: 'Save booth map',
        UTI: fileType.uti,
      });
    } catch (err) {
      logger.error('Failed to share booth map:', err as Error);
      Alert.alert('Error', 'Could not save the booth map.');
    } finally {
      setSaving(false);
    }
  }, [mapSource, mapImage]);

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Booth Map" />
        <LoadingWrap>
          <ActivityIndicator color="white" />
        </LoadingWrap>
      </ScreenContainer>
    );
  }

  if (failed || !event) {
    return (
      <ScreenContainer>
        <Header title="Booth Map" />
        <LoadError />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Booth Map" />
      <Scroll showsVerticalScrollIndicator={false}>
        <Body>
          {mapSource && (
            <>
              {/* A disabled Pressable does not claim the touch, so a tap on the busy Save chip
                  would otherwise fall through to the card and stack the zoom modal on top of the
                  share sheet — which iOS refuses, since it is already presenting. */}
              <MapCard
                onPress={() => !saving && setViewerOpen(true)}
                testID={getTestId('booth-map-image')}
              >
                <MapImage source={mapSource} onError={onMapError} />
                <ZoomHint>
                  <Icon materialIcon="magnify-plus-outline" size={12} color="white" />
                  <ChipText>Tap to enlarge</ChipText>
                </ZoomHint>
                <SaveChip
                  onPress={handleSave}
                  disabled={saving}
                  testID={getTestId('booth-map-save')}
                >
                  {saving && <ActivityIndicator size="small" color="white" />}
                  {!saving && (
                    <Icon materialIcon="tray-arrow-down" size={12} color="white" />
                  )}
                  <ChipText>Save</ChipText>
                </SaveChip>
              </MapCard>

              <MapHint>
                Save opens your phone’s share sheet — choose “Save Image” to keep the map in your
                photos, so it is there even when the signal is not.
              </MapHint>
            </>
          )}

          {!!hostBoothNumber && (
            <Callout>
              <CalloutBadge>
                <CalloutBadgeNumber>{hostBoothNumber}</CalloutBadgeNumber>
              </CalloutBadge>
              <CalloutCopy>
                <CalloutTitle>Find us at booth {hostBoothNumber}</CalloutTitle>
                <CalloutBody>
                  Whiskey Social is at booth {hostBoothNumber} all day. Come say hi and get
                  help with the app.
                </CalloutBody>
              </CalloutCopy>
            </Callout>
          )}

          {directory.length > 0 && (
            <>
              <SectionTitle>Distiller Directory</SectionTitle>
              <Directory>
                {directory.map((booth, index) => {
                  const highlighted =
                    !!hostBoothNumber && booth.boothNumber === hostBoothNumber;

                  return (
                    <DirectoryRow
                      key={booth.id}
                      highlighted={highlighted}
                      last={index === directory.length - 1}
                    >
                      <RowNumber highlighted={highlighted}>
                        <RowNumberText highlighted={highlighted}>
                          {booth.boothNumber}
                        </RowNumberText>
                      </RowNumber>
                      <RowName>{booth.name}</RowName>
                    </DirectoryRow>
                  );
                })}
              </Directory>
            </>
          )}
        </Body>
      </Scroll>

      {mapSource && (
        <ImageViewerModal
          isVisible={viewerOpen}
          images={[mapSource]}
          onDownSwipe={() => setViewerOpen(false)}
          onBackdropPress={() => setViewerOpen(false)}
        />
      )}
    </ScreenContainer>
  );
};
