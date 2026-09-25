import {
  Button,
  Header,
  HorizontalWhiskeyCard,
  Link,
  Tag,
  Text,
  Title,
} from '@components';
import { isBestMatch } from '@helpers';
import type { ScannedMatch } from '@helpers';
import {
  useAddWhiskeyToMyCollection,
  useDeleteScanImage,
  useHadPouredThisWhiskey,
  useScanWhiskeyLabel,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes, UserType, type RootStackParams } from '@types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useScanTelemetry } from './useScanTelemetry';
import {
  BadgeRow,
  BottomButtonWrapper,
  ContentContainer,
  Empty,
  LabelSummary,
  ListContainer,
  Preview,
  PreviewContainer,
  ScreenContainer,
  StatusContainer,
  StatusSpacing,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ScanBottle'>;

export const ScanBottleScreen = ({ navigation, route }: Props) => {
  const { imageUri, myUserType, intent = 'add' } = route.params;

  const { mutate: scan, data: outcome, isPending } = useScanWhiskeyLabel();
  const deleteScanImage = useDeleteScanImage();
  const { mutate: addToCollection } = useAddWhiskeyToMyCollection();
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const { recordMatchSelected, recordSuggestNew, recordRetake } = useScanTelemetry(
    intent,
    outcome
  );

  const [keepImage, setKeepImage] = useState(false);
  const imageKeyRef = useRef<string | null>(null);
  const keepImageRef = useRef(false);

  useEffect(() => {
    scan({ imageUri });
  }, [scan, imageUri]);

  useEffect(() => {
    imageKeyRef.current = outcome?.imageKey ?? null;
  }, [outcome]);

  useEffect(() => {
    keepImageRef.current = keepImage;
  }, [keepImage]);

  useEffect(
    () => () => {
      if (!keepImageRef.current) {
        deleteScanImage(imageKeyRef.current);
      }
    },
    [deleteScanImage]
  );

  const goToBottle = useCallback(
    (match: ScannedMatch, index: number) => {
      recordMatchSelected(match, index);

      const { whiskey } = match;

      if (intent === 'view') {
        navigation.navigate(Routes.WhiskeyInfo, { id: whiskey.id });
        return;
      }

      if (myUserType === UserType.VENUE) {
        addToCollection({ whiskeyId: whiskey.id });
        return;
      }

      navigation.navigate(Routes.BottleDetailsForm, { whiskey });
    },
    [intent, myUserType, navigation, addToCollection, recordMatchSelected]
  );

  const goToSuggest = useCallback(() => {
    const label = outcome && 'label' in outcome ? outcome.label : undefined;

    recordSuggestNew();
    setKeepImage(true);
    navigation.navigate(Routes.SuggestWhiskey, {
      brand: label?.brand ?? undefined,
      name: label?.name ?? undefined,
      years: label?.age ? String(label.age) : undefined,
      imageUri,
    });
  }, [navigation, outcome, imageUri, recordSuggestNew]);

  const retake = useCallback(() => {
    recordRetake();
    navigation.goBack();
  }, [navigation, recordRetake]);

  const matches = useMemo(
    () => (outcome?.status === 'matched' ? outcome.matches : []),
    [outcome]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ScannedMatch; index: number }) => (
      <HorizontalWhiskeyCard
        whiskey={item.whiskey}
        onPress={() => goToBottle(item, index)}
        pour={checkIfUserPoured(item.whiskey.id)}
      >
        <BadgeRow>{isBestMatch(matches, index) && <Tag text="Best match" />}</BadgeRow>
      </HorizontalWhiskeyCard>
    ),
    [goToBottle, checkIfUserPoured, matches]
  );

  const renderStatus = (title: string, body: string, suggest: boolean) => (
    <StatusContainer>
      <Title color="primary500" size={22} align="center">
        {title}
      </Title>
      <StatusSpacing />
      <Text align="center">{body}</Text>
      <StatusSpacing />
      {suggest && (
        <Link color="primary" onPress={goToSuggest}>
          Suggest New Whiskey.
        </Link>
      )}
    </StatusContainer>
  );

  const renderBody = () => {
    if (isPending || !outcome) {
      return (
        <StatusContainer>
          <ActivityIndicator />
          <StatusSpacing />
          <Text align="center">Reading the label…</Text>
        </StatusContainer>
      );
    }

    if (outcome.status === 'rateLimited') {
      return renderStatus('Scan limit reached', outcome.message, false);
    }

    if (outcome.status === 'failed') {
      return renderStatus('Scan unavailable', outcome.message, false);
    }

    if (outcome.status === 'notWhiskey') {
      return renderStatus('No bottle found', outcome.message, false);
    }

    if (outcome.status === 'noMatch') {
      return renderStatus(
        'Not in our catalog yet',
        `We read this as ${[outcome.label.brand, outcome.label.name]
          .filter(Boolean)
          .join(' ')}, but there is no matching bottle.`,
        true
      );
    }

    return (
      <ListContainer>
        <LabelSummary>
          <Text size={14}>
            {[outcome.label.brand, outcome.label.name].filter(Boolean).join(' ')}
          </Text>
        </LabelSummary>
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.whiskey.id}
          removeClippedSubviews
          ListFooterComponent={
            <>
              <Empty />
              <Link color="primary" onPress={goToSuggest}>
                None of these? Suggest New Whiskey.
              </Link>
              <Empty />
            </>
          }
        />
      </ListContainer>
    );
  };

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header title="Scan Bottle" />
        <PreviewContainer>
          <Preview source={{ uri: imageUri }} resizeMode="cover" />
        </PreviewContainer>
        {renderBody()}
      </ContentContainer>
      <BottomButtonWrapper>
        <Button
          label="Retake photo"
          variant="outlineDefault"
          onPress={retake}
          disabled={isPending}
          full
        />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};
