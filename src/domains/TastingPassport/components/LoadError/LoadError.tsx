import { usePassport } from '../../PassportProvider';
import { Message, RetryButton, RetryLabel, Title, Wrap } from './styles';

/**
 * Shown in place of the passport when the stored state could not be read.
 *
 * The point is what it replaces. An unstamped grid is indistinguishable from a passport
 * that really is empty, so a failed read used to render as "you have visited nothing" —
 * and the first booth the attendee tapped wrote that emptiness back over the record the
 * server was still holding. Nothing here is tappable except Retry, so there is no toggle
 * to fire against state we do not have.
 */
export const LoadError = () => {
  const { reloadPassport } = usePassport();

  return (
    <Wrap>
      <Title>We couldn&apos;t load your passport</Title>
      <Message>
        Your stamps are safe — we just can&apos;t read them right now. Check your signal
        and try again.
      </Message>
      <RetryButton onPress={reloadPassport} testID="passport-load-retry">
        <RetryLabel>Try again</RetryLabel>
      </RetryButton>
    </Wrap>
  );
};
