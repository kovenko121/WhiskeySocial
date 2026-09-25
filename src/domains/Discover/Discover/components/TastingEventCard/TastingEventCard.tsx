/**
 * Discover entry point into the Tasting Passport: the Events section, listing every event
 * that is on right now. Two festivals can be published at once, so this is a list — capped
 * at three cards, with a link through to the full Tasting Events screen when there are more.
 * Dark-launched behind the `tastingPassport` remote feature flag — shipped OFF, flipped on at
 * the event doors, killable from a laptop with no deploy.
 *
 * The section is on the clock: an event appears when it goes live — at `publishAt` for a
 * SCHEDULED event, immediately for a PUBLISHED one — and moves to Past Events once its end
 * time passes. With nothing to show at all, this renders nothing rather than empty headings.
 *
 * An event listed before its start time is browsable but not stampable; the card says so and
 * the passport behind it enforces it.
 *
 * Guests see the real events, but the Passport itself needs an account: tapping raises the
 * auth gate instead — see `useOpenPassport`.
 */
import { Title } from '@components';
import { getTestId } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, Routes } from '@types';
import { useFeatureFlags } from '../../../../../hooks/flags/useFeatureFlags';
import { EventCard } from '../../../../TastingPassport/components/EventCard/EventCard';
import { useOpenPassport } from '../../../../TastingPassport/data/useOpenPassport';
import { useOpenTastingEvents } from '../../../../TastingPassport/data/useTastingEventContent';
import { EventList, Link, TitleContainer } from './styles';

/** Discover is a stack of sections; the rest of the roster lives on its own screen. */
const MAX_CARDS = 3;

export const TastingEventCard = () => {
  const navigation = useNavigation<NavigationProps>();
  const { data: flags } = useFeatureFlags();
  // Same source as the Passport screen, so the cards and the screen they open can
  // never disagree. Guests read the same roster; a read that fails reports nothing
  // on, and the section stays off the screen rather than inventing a night.
  const { events, past, loading } = useOpenTastingEvents();
  const openPassport = useOpenPassport();

  // Gated by the remote flag in every environment: the section renders only when
  // `tastingPassport` resolves on for the current user (global value, or a per-user
  // allowlist hit). No flag row — or a false one — means it never renders.
  if (!flags?.tastingPassport) return null;

  // Hold the section back until the roster resolves rather than flashing a heading
  // over cards that are still a moment away.
  if (loading) return null;

  // Nothing current and nothing finished: Discover renders no heading at all rather
  // than an empty section. See `eventWindow` for what counts as which.
  if (events.length === 0 && past.length === 0) return null;

  const currentCards = events.slice(0, MAX_CARDS);
  const pastCards = past.slice(0, MAX_CARDS);

  return (
    <>
      {currentCards.length > 0 && (
        <>
          <TitleContainer>
            <Title size={18} align="left">
              Events
            </Title>
            {events.length > MAX_CARDS && (
              <Link
                testID={getTestId('go-to-tasting-events')}
                onPress={() => navigation.navigate(Routes.TastingEvents)}
                color="primary500"
              >
                See All
              </Link>
            )}
          </TitleContainer>
          <EventList>
            {currentCards.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => openPassport(event.id)}
                testID={
                  index === 0
                    ? 'discover-tasting-event'
                    : `discover-tasting-event-${index}`
                }
              />
            ))}
          </EventList>
        </>
      )}

      {pastCards.length > 0 && (
        <>
          <TitleContainer>
            <Title size={18} align="left">
              Past Events
            </Title>
            {past.length > MAX_CARDS && (
              <Link
                testID={getTestId('go-to-past-tasting-events')}
                onPress={() => navigation.navigate(Routes.TastingEvents)}
                color="primary500"
              >
                See All
              </Link>
            )}
          </TitleContainer>
          <EventList>
            {pastCards.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => openPassport(event.id)}
                testID={`discover-past-tasting-event-${index}`}
              />
            ))}
          </EventList>
        </>
      )}
    </>
  );
};
