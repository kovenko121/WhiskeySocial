import { useCallback, useRef } from 'react';
import { useAuth, useAuthGate } from '@contexts';
import type { PendingDestination } from '@services';
import type { NudgeIntent } from '../copy/nudges';

/**
 * Returns a wrapper that intercepts calls for guest users.
 * When isGuest is true, shows the auth gate bottom sheet instead of
 * executing the action. When authenticated, executes the action normally.
 *
 * Pass `destination` for a guard that stands in front of a screen: taking the
 * sheet's CTA remembers it, and the user is dropped there once the account
 * exists instead of being left on Home.
 *
 * Usage:
 *   const guardedCheckin = useGuestGuard('pour_log');
 *   <Button onPress={() => guardedCheckin(() => openCheckin(venue))} />
 */
const useGuestGuard = (
  intent: NudgeIntent,
  destination?: PendingDestination
) => {
  const { isGuest } = useAuth();
  const triggerAuthGate = useAuthGate();
  // A fresh object every render, so it rides in a ref instead of the dep list —
  // callers get a callback whose identity is stable.
  const destinationRef = useRef(destination);
  destinationRef.current = destination;

  return useCallback(
    (action: () => void) => {
      if (isGuest) {
        triggerAuthGate(intent, destinationRef.current);
        return;
      }
      action();
    },
    [isGuest, triggerAuthGate, intent]
  );
};

export { useGuestGuard };
