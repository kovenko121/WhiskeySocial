/**
 * Event header on the Passport screen: brand-style logo tile, event name, the date/time/venue
 * line, and a circular "?" button that reopens the onboarding guide.
 */
import { getTestId } from '@helpers';
import { useEventArtwork } from '../../../data/useEventArtwork';
import { TastingEvent } from '../../../types';
import {
  Container,
  EventName,
  HelpButton,
  HelpMark,
  Info,
  Logo,
  LogoTile,
  SubLine,
} from './styles';

type Props = {
  event: TastingEvent;
  onHelp: () => void;
};

export const EventHeader = ({ event, onHelp }: Props) => {
  const artwork = useEventArtwork(event.image);

  return (
    <Container>
      <LogoTile>
        <Logo
          source={artwork.source}
          resizeMode="contain"
          resizeMethod="scale"
          onError={artwork.onError}
        />
      </LogoTile>
      <Info>
        <EventName numberOfLines={2}>{event.name}</EventName>
        {/* The CMS keeps date, time and location in one free-text description, so
            this line needs room to breathe — capped at 3 lines. */}
        <SubLine numberOfLines={3}>
          {[event.dateLabel, event.timeLabel, event.venue]
            .filter(Boolean)
            .join(' · ')}
        </SubLine>
      </Info>
      <HelpButton onPress={onHelp} testID={getTestId('passport-help')}>
        <HelpMark>?</HelpMark>
      </HelpButton>
    </Container>
  );
};
