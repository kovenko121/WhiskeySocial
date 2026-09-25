import { Divider, Header, Switch } from '@components';
import { getTestId } from '@helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Routes } from '@types';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { BrandBadge } from '../components/BrandBadge/BrandBadge';
import { ClosedBanner } from '../components/ClosedBanner/ClosedBanner';
import { LoadError } from '../components/LoadError/LoadError';
import { UnsavedBanner } from '../components/UnsavedBanner/UnsavedBanner';
import { trackBoothViewed } from '../data/passportAnalytics';
import { PassportProvider, usePassport } from '../PassportProvider';
import { resolveShareEmail } from '../state/stateMachine';
import { PourCard } from './components/PourCard';
import { ToggleButton } from './components/ToggleButton';
import { Pour } from '../types';
import { boothLogo } from '../utils';
import {
  Body,
  BrandHead,
  BrandHeadInfo,
  BrandLocation,
  BrandName,
  EmailLabel,
  EmailRow,
  EmptyPours,
  NotesInput,
  Scroll,
  ScreenContainer,
  SectionLabel,
  ToggleRow,
} from './styles';

const NOTES_PLACEHOLDER =
  'Anything you want to remember about this booth or what you tasted? (optional)';

const NO_POURS: Pour[] = [];

const NO_POURS_MESSAGE =
  'This booth has not listed its pours yet. Ask at the booth to see what they are opening tonight.';

/**
 * A booth pours exactly what the CMS curated for it. A booth nobody curated keeps the
 * section and says it is empty — never the brand's wider catalogue, which is not what
 * is on the table, and never sample bottles, which are not on it either.
 */
const resolvePours = (curated: Pour[]): { pours: Pour[]; label: string } => {
  if (curated.length > 0) return { pours: curated, label: 'Pouring Today' };
  return { pours: NO_POURS, label: 'Pouring Today' };
};

type ContentProps = {
  boothId: string;
  onOpenBottle: (whiskeyId: string) => void;
};

const DetailContent = ({ boothId, onOpenBottle }: ContentProps) => {
  const {
    event,
    attendeeId,
    isOpen,
    loading,
    loadFailed,
    getBooth,
    getBrand,
    getPour,
    boothHasFavPour,
    setWant,
    setWent,
    setFav,
    setNotes,
    setShareEmail,
    setPourTasted,
    setPourFav,
    shareContact,
  } = usePassport();

  // Once per opening, and only against real state — same reason as `passport_opened`.
  const viewReported = useRef(false);
  useEffect(() => {
    if (loading || loadFailed || viewReported.current) return;
    viewReported.current = true;
    trackBoothViewed(event, attendeeId, boothId);
  }, [loading, loadFailed, event, attendeeId, boothId]);

  const booth = event.booths.find((b) => b.id === boothId);
  const brand = booth ? getBrand(boothId) : undefined;

  if (!booth) return null;

  // Every control below writes a FULL booth record. Rendering them against state that has
  // not loaded — or failed to — is how a tap wipes what the server is holding.
  if (loading) return <ActivityIndicator color="white" />;
  if (loadFailed) return <LoadError />;

  const status = getBooth(boothId);
  // The booth snapshot wins: a brand renamed for this event keeps the event name.
  const displayName = booth.name || brand?.brandName || '';
  const locationLabel = booth.location || brand?.brandCountry || '';
  const { pours, label: poursLabel } = resolvePours(booth.pours ?? NO_POURS);
  // Rule 4: only a Favorite — of the booth or of one of its bottles — arms this by default.
  // An event-level opt-out means nothing is shared with anyone, so every booth reads OFF.
  // Switching one back on is an explicit choice and lifts that opt-out (see the store).
  const shareEmailValue =
    shareContact && resolveShareEmail(status.shareEmail, status, boothHasFavPour(boothId));

  return (
    <Scroll
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Body>
        <BrandHead>
          <BrandBadge
            name={displayName}
            size={56}
            dark={booth.darkLogo}
            logo={boothLogo(booth, brand)}
          />
          <BrandHeadInfo>
            <BrandName numberOfLines={2}>{displayName}</BrandName>
            <BrandLocation numberOfLines={1}>{locationLabel}</BrandLocation>
          </BrandHeadInfo>
        </BrandHead>

        <UnsavedBanner />
        <ClosedBanner />

        <ToggleRow>
          <ToggleButton
            icon="pin"
            label="Want to Go"
            active={status.want}
            activeColor="toGoGreen"
            onPress={() => setWant(boothId, !status.want)}
            disabled={!isOpen}
            testID="booth-toggle-togo"
          />
          <ToggleButton
            icon="check"
            label="Visited"
            active={status.went}
            activeColor="warning"
            onPress={() => setWent(boothId, !status.went)}
            disabled={!isOpen}
            testID="booth-toggle-visited"
          />
          <ToggleButton
            icon="heart"
            label="Favorite"
            active={status.fav}
            activeColor="red"
            onPress={() => setFav(boothId, !status.fav)}
            disabled={!isOpen}
            testID="booth-toggle-favorite"
          />
        </ToggleRow>

        <SectionLabel>Notes</SectionLabel>
        <NotesInput
          defaultValue={status.notes}
          placeholder={NOTES_PLACEHOLDER}
          maxLength={2000}
          editable={isOpen}
          onChangeText={(text: string) => setNotes(boothId, text)}
          testID={getTestId('booth-notes')}
        />

        <Divider mt={24} mb={0} h={0} color="grey400" />
        <EmailRow>
          <EmailLabel>Share your email with {displayName}</EmailLabel>
          <Switch
            initValue={shareEmailValue}
            showText={false}
            onValueChange={(value) => setShareEmail(boothId, value)}
          />
        </EmailRow>

        <SectionLabel>{poursLabel}</SectionLabel>
        {pours.length === 0 && <EmptyPours>{NO_POURS_MESSAGE}</EmptyPours>}
        {pours.map((pour) => {
          // The bottle page keys off a catalogue `Whiskey` id; sample and
          // hand-added pours have none, so their card stays inert.
          const whiskeyId = pour.whiskeyRefId;
          return (
            <PourCard
              key={pour.id}
              pour={pour}
              status={getPour(boothId, pour.id)}
              onTasted={(value) => setPourTasted(boothId, pour.id, value)}
              onFav={(value) => setPourFav(boothId, pour.id, value)}
              onOpen={whiskeyId ? () => onOpenBottle(whiskeyId) : undefined}
              disabled={!isOpen}
            />
          );
        })}
      </Body>
    </Scroll>
  );
};

type Props = NativeStackScreenProps<RootStackParams, 'DistillerDetail'>;

export const DistillerDetailScreen = ({ navigation, route }: Props) => {
  const { eventId, boothId } = route.params;

  return (
    <ScreenContainer>
      <Header title="Booth" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PassportProvider eventId={eventId}>
          <DetailContent
            boothId={boothId}
            onOpenBottle={(id) =>
              navigation.navigate(Routes.WhiskeyInfo, { id })
            }
          />
        </PassportProvider>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
