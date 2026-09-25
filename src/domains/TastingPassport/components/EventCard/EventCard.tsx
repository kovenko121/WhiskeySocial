import { Icon } from '@components';
import { getTestId } from '@helpers';
import { useEventArtwork } from '../../data/useEventArtwork';
import { TastingEventSummary } from '../../data/useTastingEventContent';
import {
  Card,
  Chevron,
  Details,
  DraftBadge,
  DraftLabel,
  EventName,
  SoonBadge,
  SoonLabel,
  Info,
  Logo,
  LogoPanel,
  SubLine,
} from './styles';

type Props = {
  event: TastingEventSummary;
  onPress: () => void;
  testID: string;
};

/**
 * One event row — white logo panel, event name, date/venue, chevron. Shared by the
 * Discover section and the Tasting Events screen so a festival looks the same
 * wherever it is listed.
 *
 * A draft carries a badge above its name. Only an admin is ever sent one, and the
 * badge is what keeps it from reading as a live festival on the same screen as real
 * ones — it is content still being built, shown early on purpose.
 */
export const EventCard = ({ event, onPress, testID }: Props) => {
  const artwork = useEventArtwork(event.image);

  return (
    <Card onPress={onPress} testID={getTestId(testID)}>
      <LogoPanel>
        <Logo
          source={artwork.source}
          resizeMode="contain"
          resizeMethod="scale"
          onError={artwork.onError}
        />
      </LogoPanel>
      <Info>
        <Details>
          {event.isDraft && (
            <DraftBadge>
              <DraftLabel>DRAFT</DraftLabel>
            </DraftBadge>
          )}
          {!event.isDraft && event.notStarted && (
            <SoonBadge>
              <SoonLabel>NOT STARTED</SoonLabel>
            </SoonBadge>
          )}
          <EventName numberOfLines={2}>{event.name}</EventName>
          {/* The backend carries date + venue as one free-text description, so
              it needs room to breathe — capped at 3 lines so a long entry
              can't run the card off the screen. */}
          <SubLine numberOfLines={3}>{event.venue}</SubLine>
        </Details>
        <Chevron>
          <Icon name="right" size={14} color="primary500" />
        </Chevron>
      </Info>
    </Card>
  );
};
