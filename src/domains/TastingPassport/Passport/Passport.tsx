import { Header } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Routes } from '@types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { ClosedBanner } from '../components/ClosedBanner/ClosedBanner';
import { LoadError } from '../components/LoadError/LoadError';
import { UnsavedBanner } from '../components/UnsavedBanner/UnsavedBanner';
import { OnboardingSheet } from '../Onboarding/OnboardingSheet';
import { trackPassportOpened } from '../data/passportAnalytics';
import { PassportProvider, usePassport } from '../PassportProvider';
import { boothMatchesFilters } from '../state/stateMachine';
import { FilterChip } from '../types';
import {
  DistillerTile,
  EventHeader,
  FilterChips,
  PoursTonight,
  TrendingTonight,
} from './components';
import {
  Body,
  CompleteBanner,
  CompleteText,
  Grid,
  LoadingWrap,
  Scroll,
  ScreenContainer,
} from './styles';

type ContentProps = {
  onOpenBooth: (boothId: string) => void;
  onOpenLeaderboard: () => void;
  onOpenBoothMap: () => void;
};

const PassportContent = ({
  onOpenBooth,
  onOpenLeaderboard,
  onOpenBoothMap,
}: ContentProps) => {
  const {
    event,
    attendeeId,
    loading,
    loadFailed,
    showLeaderboard,
    leaderboard,
    getBooth,
    getBrand,
    boothTastedCount,
    tastedPours,
    visitedCount,
    isComplete,
    onboarded,
    markOnboarded,
  } = usePassport();

  const [activeChips, setActiveChips] = useState<FilterChip[]>([]);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  // Show the guide automatically the first time this passport is opened.
  useEffect(() => {
    if (!loading && !onboarded) setOnboardingVisible(true);
  }, [loading, onboarded]);

  // One `passport_opened` per visit, once the state behind it is real — reporting on an
  // opening that turned out to be a failed read would inflate every funnel built on it.
  const openReported = useRef(false);
  useEffect(() => {
    if (loading || loadFailed || openReported.current) return;
    openReported.current = true;
    trackPassportOpened(event, attendeeId, visitedCount);
  }, [loading, loadFailed, event, attendeeId, visitedCount]);

  // Single-select: tapping a chip makes it the only filter; tapping the active one clears it.
  const toggleChip = (chip: FilterChip) =>
    setActiveChips((prev) => (prev.includes(chip) ? [] : [chip]));

  const closeOnboarding = () => {
    setOnboardingVisible(false);
    markOnboarded();
  };

  const visibleBooths = useMemo(
    () =>
      event.booths.filter((booth) =>
        boothMatchesFilters(activeChips, getBooth(booth.id), boothTastedCount(booth.id)),
      ),
    [event.booths, activeChips, getBooth, boothTastedCount],
  );

  if (loading) {
    return (
      <LoadingWrap>
        <ActivityIndicator color="white" />
      </LoadingWrap>
    );
  }

  // Never the grid: an unstamped grid here would read as an empty passport, and the first
  // tap on it would write that over the stored one.
  if (loadFailed) return <LoadError />;

  return (
    <>
      <Scroll showsVerticalScrollIndicator={false}>
        <Body>
          <EventHeader event={event} onHelp={() => setOnboardingVisible(true)} />
          <UnsavedBanner />
          <ClosedBanner />
          {showLeaderboard && (
            <TrendingTonight
              rows={leaderboard.slice(0, 3)}
              onOpenLeaderboard={onOpenLeaderboard}
            />
          )}
          <FilterChips active={activeChips} onToggle={toggleChip} />
          <Grid>
            {visibleBooths.map((booth) => (
              <DistillerTile
                key={booth.id}
                booth={booth}
                status={getBooth(booth.id)}
                tastedCount={boothTastedCount(booth.id)}
                brand={getBrand(booth.id)}
                onPress={() => onOpenBooth(booth.id)}
              />
            ))}
          </Grid>
          {isComplete && (
            <CompleteBanner>
              <CompleteText>Passport Complete!</CompleteText>
            </CompleteBanner>
          )}
          <PoursTonight pours={tastedPours} />
        </Body>
      </Scroll>

      <OnboardingSheet
        visible={onboardingVisible}
        onClose={closeOnboarding}
        onOpenBoothMap={onOpenBoothMap}
      />
    </>
  );
};

type ScreenProps = NativeStackScreenProps<RootStackParams, 'Passport'>;

export const PassportScreen = ({ navigation, route }: ScreenProps) => {
  const { eventId } = route.params;

  return (
    <ScreenContainer>
      <Header title="Tasting Passport" />
      <PassportProvider eventId={eventId}>
        <PassportContent
          onOpenBooth={(boothId) =>
            navigation.navigate(Routes.DistillerDetail, { eventId, boothId })
          }
          onOpenLeaderboard={() => navigation.navigate(Routes.Leaderboard, { eventId })}
          onOpenBoothMap={() => navigation.navigate(Routes.BoothMap, { eventId })}
        />
      </PassportProvider>
    </ScreenContainer>
  );
};
