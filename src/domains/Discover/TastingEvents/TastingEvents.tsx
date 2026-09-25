/**
 * Tasting Events — the whole roster, reached from Discover's "See All" once more events
 * are on than the section shows. Same cards, same order, no cap: this screen is the
 * guarantee that publishing one festival can never hide another. Finished events follow
 * under their own heading rather than being dropped.
 *
 * Not behind its own flag check: the only way in is the Discover section, which is
 * already gated on `tastingPassport`.
 */
import { Header } from '@components';
import { ActivityIndicator } from 'react-native';
import { EventCard } from '../../TastingPassport/components/EventCard/EventCard';
import { useOpenPassport } from '../../TastingPassport/data/useOpenPassport';
import { useOpenTastingEvents } from '../../TastingPassport/data/useTastingEventContent';
import {
  Body,
  EmptyText,
  ScreenContainer,
  Scroll,
  SectionHeading,
} from './styles';

const NOTHING_ON =
  'No events are running right now. Check back when the next one opens its doors.';

export const TastingEventsScreen = () => {
  const { events, past, loading } = useOpenTastingEvents();
  const openPassport = useOpenPassport();

  return (
    <ScreenContainer>
      <Header title="Events" />
      <Scroll showsVerticalScrollIndicator={false}>
        <Body>
          {loading && <ActivityIndicator color="white" />}
          {!loading && events.length === 0 && past.length === 0 && (
            <EmptyText>{NOTHING_ON}</EmptyText>
          )}
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => openPassport(event.id)}
              testID={`tasting-event-${index}`}
            />
          ))}
          {past.length > 0 && <SectionHeading>Past Events</SectionHeading>}
          {past.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => openPassport(event.id)}
              testID={`past-tasting-event-${index}`}
            />
          ))}
        </Body>
      </Scroll>
    </ScreenContainer>
  );
};
