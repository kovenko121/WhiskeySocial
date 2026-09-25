import { usePassport } from '../../PassportProvider';
import { Banner, Message } from './styles';

export const NOT_STARTED_MESSAGE =
  'This feature will be available when the event is live.';

export const ENDED_MESSAGE =
  'This event has wrapped. Your passport is saved as you left it — nothing new can be stamped.';

export const ClosedBanner = () => {
  const { isOpen, notStarted } = usePassport();

  if (isOpen) return null;

  return (
    <Banner>
      {notStarted && <Message>{NOT_STARTED_MESSAGE}</Message>}
      {!notStarted && <Message>{ENDED_MESSAGE}</Message>}
    </Banner>
  );
};
