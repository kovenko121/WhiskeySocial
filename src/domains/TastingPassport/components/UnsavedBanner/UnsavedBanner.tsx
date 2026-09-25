import { usePassport } from '../../PassportProvider';
import { Banner, Message, RetryButton, RetryLabel } from './styles';

/**
 * Shown only once queued changes have stopped landing. Until then the passport is
 * deliberately silent — a write in flight at a festival is normal and a badge on every
 * tap would be noise. What it must never do is stay quiet forever: an attendee looking at
 * a selection the server never took is the failure this whole change exists to end.
 */
export const UnsavedBanner = () => {
  const { unsavedCount, saveFailed, retrySaves } = usePassport();

  if (!saveFailed) return null;

  const noun = unsavedCount === 1 ? 'change' : 'changes';

  return (
    <Banner>
      <Message>
        {unsavedCount} {noun} haven&apos;t saved yet — we&apos;ll keep trying while
        you&apos;re here.
      </Message>
      <RetryButton onPress={retrySaves} testID="passport-unsaved-retry">
        <RetryLabel>Retry</RetryLabel>
      </RetryButton>
    </Banner>
  );
};
